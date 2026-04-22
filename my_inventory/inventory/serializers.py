from rest_framework import serializers
from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
     stock_status = serializers.CharField(read_only=True)
     id = serializers.CharField(source='item_id', read_only=True)
     class Meta:
          model=InventoryItem
          fields=[
               'id', 'name', 'sku', 'category',
            'quantity_on_hand', 'reorder_point',
            'unit_cost', 'supplier', 'notes', 'stock_status'
          ]

class InventoryUpdateSerializer(serializers.Serializer):
    reorder_point = serializers.IntegerField(min_value=0, required=False)
    notes = serializers.CharField(allow_blank=True, required=False)

    def validate(self, data):
        if not data:
            raise serializers.ValidationError(
                "At least one field (reorder_point or notes) is required."
            )
        return data