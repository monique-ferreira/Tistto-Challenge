from django.shortcuts import render, redirect
from django.views import View
from django.views.generic.list import ListView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.urls import reverse_lazy

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.serializers import AuthTokenSerializer
from .serializers import TaskSerializer

from rest_framework.decorators import api_view
from django.contrib.auth.hashers import make_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from django.contrib.auth.views import LoginView
from django.contrib.auth.mixins import LoginRequiredMixin

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

from django.contrib.auth import logout

from .models import Task

class CustomLoginView(LoginView):
    template_name = 'tasks/login.html'
    fields = '__all__'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('tasks')

class CustomLogoutView(View):
    def get(self, request):
        try:
            logout(request)
            return redirect('login')
        except Exception as e:
            print(f'Error: {e}')
            return redirect('login')
        
class RegisterPage(FormView):
    template_name = 'tasks/register.html'
    form_class = UserCreationForm
    redirect_authenticated_user = True
    success_url = reverse_lazy('tasks')

    def form_valid(self, form):
        user = form.save()
        if user is not None:
            login(self.request, user)
        return super(RegisterPage, self).form_valid(form)
    
    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect('tasks')
        return super(RegisterPage, self).get(*args, **kwargs)

class TaskList(LoginRequiredMixin, ListView):
    model = Task
    context_object_name = 'tasks'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['tasks'] = context['tasks'].filter(user=self.request.user)
        context['count'] = context['tasks'].filter(complete=False).count()

        search_input = self.request.GET.get('search') or ''
        if search_input:
            context['tasks'] = context['tasks'].filter(title__icontains=search_input)
        
        context['search_input'] = search_input
        return context

class TaskDetail(LoginRequiredMixin, DetailView):
    model = Task
    context_object_name = 'task'
    template_name = 'tasks/task.html'

class TaskCreate(LoginRequiredMixin, CreateView):
    model = Task
    fields = ['title', 'description', 'complete']
    success_url = reverse_lazy('tasks')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super(TaskCreate, self).form_valid(form)

class TaskUpdate(LoginRequiredMixin, UpdateView):
    model = Task
    fields = ['title', 'description', 'complete']
    success_url = reverse_lazy('tasks')

class TaskDelete(LoginRequiredMixin, DeleteView):
    model = Task
    context_object_name = 'task'
    success_url = reverse_lazy('tasks')

#API

class LoginAPIView(APIView):
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        return self.serializer_class.validate(self.request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

class LogoutAPIView(APIView):
    def post(self, request, *args, **kwargs):
        token = Token.objects.filter(user=request.user).first() # type: ignore
        if token:
            token.delete()
        return Response({'message': 'Deslogado com sucesso'})

class RegisterAPIView(APIView):
    @api_view(['post'])
    def register_user(request):
        username = request.data.get('Usuário')
        email = request.data.get('Email')
        password = request.data.get('Senha')

        if not username or not password or not email:
            return Response({'message': 'Preencha todos os campos'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            validate_email(email)
        except ValidationError:
            return Response({'message': 'E-mail inválido'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists(): # type: ignore
            return Response({'message': 'Usuário já existe'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists(): # type: ignore
            return Response({'message': 'E-mail em uso'}, status=status.HTTP_400_BAD_REQUEST)

        user = User(username=username, email=email, password=make_password(password)) # type: ignore
        user.save()
        return Response({'message': 'Usuário criado com sucesso'}, status=status.HTTP_201_CREATED)

class TaskListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return None

    def get(self, request, pk, *args, **kwargs):
        task = self.get_object(pk)
        if task:
            serializer = TaskSerializer(task)
            return Response(serializer.data)
        return Response({'error': 'Tarefa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

class TaskCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class TaskUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return None

    def put(self, request, pk, *args, **kwargs):
        task = self.get_object(pk)
        if task:
            serializer = TaskSerializer(task, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Tarefa não encontrada'}, status=status.HTTP_404_NOT_FOUND)

class TaskDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Task.objects.get(pk=pk)
        except Task.DoesNotExist:
            return None

    def delete(self, request, pk, *args, **kwargs):
        task = self.get_object(pk)
        if task:
            task.delete()
            return Response({'message': 'Tarefa deletada'}, status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Task não encontrada'}, status=status.HTTP_404_NOT_FOUND)