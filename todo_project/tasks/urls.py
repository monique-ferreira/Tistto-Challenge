from django.urls import path
from .views import TaskList, TaskDetail, TaskCreate, TaskUpdate, TaskDelete, CustomLoginView, CustomLogoutView, RegisterPage
from django.contrib.auth.views import LogoutView

from .views import TaskListAPIView, TaskDetailAPIView, TaskCreateAPIView, TaskUpdateAPIView, TaskDeleteAPIView, LoginAPIView, LogoutAPIView, RegisterAPIView

from django.urls import path
from . import views

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('register/', RegisterPage.as_view(), name='register'),

    path('', TaskList.as_view(), name='tasks'),
    path('task/<int:pk>/', TaskDetail.as_view(), name='task'),
    path('task-create', TaskCreate.as_view(), name='task-create'),
    path('task-update/<int:pk>/', TaskUpdate.as_view(), name='task-update'),
    path('task-delete/<int:pk>/', TaskDelete.as_view(), name='task-delete'),

    path('api/login/', LoginAPIView.as_view()),
    path('api/logout/', LogoutAPIView.as_view()),
    path('api/register/', RegisterAPIView.as_view()),

    path('api/tasks/', TaskListAPIView.as_view()),
    path('api/tasks/<int:pk>/', TaskDetailAPIView.as_view()),
    path('api/tasks/create/', TaskCreateAPIView.as_view()),
    path('api/tasks/<int:pk>/update/', TaskUpdateAPIView.as_view()),
    path('api/tasks/<int:pk>/delete/', TaskDeleteAPIView.as_view()),
]