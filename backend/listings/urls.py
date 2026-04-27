from django.urls import path
from .views import (
    BoatListCreateView,
    BoatDetailView,
    BoatConditionsView,
    MyBoatsView,
    MyBoatUpdateView,
)

urlpatterns = [
    path('', BoatListCreateView.as_view(), name='boat-list-create'),
    path('mine/', MyBoatsView.as_view(), name='my-boats'),
    path('mine/<int:pk>/', MyBoatUpdateView.as_view(), name='my-boat-update'),
    path('<int:pk>/conditions/', BoatConditionsView.as_view(), name='boat-conditions'),
    path('<int:pk>/', BoatDetailView.as_view(), name='boat-detail'),
]