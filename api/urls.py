from rest_framework.routers import SimpleRouter
from .views import UserViewSet, GroupViewSet, FilterView
from django.urls import path


router = SimpleRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('filter/', FilterView.as_view()),
]
urlpatterns += router.urls
