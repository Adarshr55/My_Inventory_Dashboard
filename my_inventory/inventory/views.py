from django.shortcuts import render
from .models import InventoryItem
from .serializers import InventoryItemSerializer,InventoryUpdateSerializer
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
# Create your views here.

class InvetoryListView(APIView):
    def get(self,request):
        queryset = InventoryItem.objects.all()
         
        category = request.query_params.get('category')
        stock_status = request.query_params.get('stock_status')
        name = request.query_params.get('name')

        if category:
            queryset = queryset.filter(category__iexact=category)

        if name:
            queryset = queryset.filter(name__icontains=name)

        valid_statuses = {'in_stock', 'low_stock', 'out_of_stock'}
        if stock_status:
            if stock_status not in valid_statuses:
                 return Response(
                    {"error": f"Invalid stock_status. Choose from: {', '.join(valid_statuses)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            queryset= [item for item in queryset if item.stock_status == stock_status]

        serializer = InventoryItemSerializer(queryset, many=True)
        return Response(serializer.data)
    

class InventoryDetailView(APIView):
    def get_object(self, item_id):
        try:
            return InventoryItem.objects.get(item_id=item_id)
        except InventoryItem.DoesNotExist:
            return None
    def get(self, request, item_id):
        item = self.get_object(item_id)
        if not item:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(InventoryItemSerializer(item).data)
    def patch(self, request, item_id):
         item = self.get_object(item_id)
         if not item:
            return Response({"error": "Item not found."}, status=status.HTTP_404_NOT_FOUND)
         serializer = InventoryUpdateSerializer(data=request.data)
         if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
         data = serializer.validated_data
         if 'reorder_point' in data:
            item.reorder_point = data['reorder_point']
         if 'notes' in data:
            item.notes = data['notes']
         item.save()
         return Response(InventoryItemSerializer(item).data)


