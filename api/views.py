from django.db.models import RestrictedError, Q
from django.core.exceptions import ValidationError

from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.exceptions import ParseError

from .serializer import UserSerializer, GroupSerializer
from .models import User, Group


class UserViewSet(ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'


class GroupViewSet(ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    lookup_field = 'id'

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except RestrictedError:
            raise ParseError(f"Cannot delete group '{instance.name}' because it still has members.")
        return Response(status=status.HTTP_204_NO_CONTENT)


class FilterView(GenericAPIView):

    table = None

    tables = {
            'users': {
                'fields': {
                    'id': ['exact', 'from', 'until'],
                    'username': ['exact', 'like', 'any', 'start', 'end'],
                    'create': ['exact', 'from', 'until'],
                    'group': ['exact', 'like', 'any', 'start', 'end']
                }
            },
            'groups': {
                'fields': {
                    'id': ['exact', 'from', 'until'],
                    'name': ['exact', 'like', 'any', 'start', 'end'],
                    'description': ['exact', 'like', 'any', 'start', 'end']
                }
            }
    }

    query_map = {
                'exact': 'exact',
                'from': 'gte',
                'until': 'lte',
                'like': 'icontains',
                'any': 'in',
                'start': 'istartswith',
                'end': 'iendswith'
            }

    queryset_list = {'users': User, 'groups': Group}
    serializer_class_list = {'users': UserSerializer, 'groups': GroupSerializer}

    query = {
        'filter': {},
        'exclude': {}
    }

    def get_queryset(self):
        queryset = self.queryset_list.get(self.table)

        filter_prop = self.query.get('filter')
        exclude_prop = self.query.get('exclude')

        queryset = queryset.objects.filter(Q(**filter_prop), Q(**exclude_prop, _connector='OR', _negated=True))
        return queryset

    def get_serializer_class(self):
        self.serializer_class = self.serializer_class_list.get(self.table)
        return self.serializer_class

    def post(self, request):
        self.query['filter'].clear()
        self.query['exclude'].clear()
        match request.data:
            case {'table': 'users' | 'groups' as table, 'filter': [{}, *_] as filter_list}:
                self.table = table
                for f in filter_list:
                    method = 'filter'
                    match f:
                        case {'field': str() as field,
                              'filter_function': str() as filter_function,
                              'filter_input': str() | [*_] as filter_input} \
                        if field.strip() != '' and filter_function.strip() != '':  # Guard

                            if field == 'id' and not filter_input.isdigit():
                                raise ParseError('Incorrect input.')

                            if 'exclude' in filter_function:
                                match filter_function.split('_'):
                                    case ['exclude', str() as filter_function]:
                                        method = 'exclude'
                                    case _:
                                        raise ParseError(f'Incorrect filter function.')

                            match filter_function, filter_input:
                                case 'any', str() | []:
                                    raise ParseError('This function requires a list with elements as input.')
                                case q, [*_] if q != 'any':
                                    raise ParseError('Incorrect input.')

                            match self.tables[table]['fields'].get(field):
                                case [*_] as allowed_query if filter_function in allowed_query:
                                    if field == 'group':
                                        field += '__name'
                                    lookup = '__'.join([field, self.query_map[filter_function]])
                                case _:
                                    raise ParseError(f"Incorrect field '{field}' or function '{filter_function}'.")
                        case _:
                            raise ParseError('Bad syntax')

                    self.query[method][lookup] = filter_input
            case _:
                raise ParseError('Incorrect table or empty filter list.')

        try:
            queryset = self.get_queryset()
        except ValidationError as e:
            raise ParseError({'detail': e.messages[0]})

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
