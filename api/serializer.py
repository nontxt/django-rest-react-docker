from rest_framework import serializers
from .models import User, Group


class UserSerializer(serializers.ModelSerializer):
    groups = Group.objects.all()
    group = serializers.SlugRelatedField(slug_field='name', queryset=groups)
    class Meta:
        model = User
        fields = '__all__'


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'
