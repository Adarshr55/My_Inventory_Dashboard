from django.db import models

# Create your models here.

class InventoryItem(models.Model):
    item_id = models.CharField(max_length=20, unique=True)  # e.g. INV-001
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    quantity_on_hand = models.IntegerField(default=0)
    reorder_point = models.IntegerField(default=0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=255)
    notes = models.TextField(blank=True, default='')


    def __str__(self):
        return f"{self.item_id} - {self.name}"
    
    @property
    def stock_status(self):
        if self.quantity_on_hand == 0:
            return 'out_of_stock'
        elif self.quantity_on_hand <= self.reorder_point:
            return 'low_stock'
        return 'in_stock'
    