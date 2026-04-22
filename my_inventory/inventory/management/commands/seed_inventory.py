import json
import os
from django.core.management.base import BaseCommand
from inventory.models import InventoryItem

class Command(BaseCommand):
    help = 'Seed inventory data from data/inventory.json'

    def handle(self, *args, **kwargs):
        path = os.path.join('data', 'inventory.json')
        with open(path) as f:
            items = json.load(f)

        count = 0
        for item in items:
            _, created = InventoryItem.objects.get_or_create(
                item_id=item['id'],
                defaults={
                    'name': item['name'],
                    'sku': item['sku'],
                    'category': item['category'],
                    'quantity_on_hand': item['quantity_on_hand'],
                    'reorder_point': item['reorder_point'],
                    'unit_cost': item['unit_cost'],
                    'supplier': item['supplier'],
                    'notes': item.get('notes', ''),
                }
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Seeded {count} items successfully.'))