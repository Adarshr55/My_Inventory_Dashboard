from django.urls import path
from .import views

urlpatterns=[
     path('inventory/',views.InvetoryListView.as_view()),
     path('inventory/<str:item_id>/',views.InventoryDetailView.as_view())

]