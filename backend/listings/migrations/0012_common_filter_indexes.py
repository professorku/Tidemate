from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0011_boatimage_thumbnail'),
    ]

    operations = [
        migrations.AddIndex(model_name='boatlisting', index=models.Index(fields=['host', '-created_at', '-id'], name='boat_host_created_idx')),
        migrations.AddIndex(model_name='boatlisting', index=models.Index(fields=['boat_type', '-created_at', '-id'], name='boat_type_created_idx')),
        migrations.AddIndex(model_name='boatlisting', index=models.Index(fields=['price_per_day', '-created_at', '-id'], name='boat_price_created_idx')),
        migrations.AddIndex(model_name='boatlisting', index=models.Index(fields=['guests', '-created_at', '-id'], name='boat_guests_created_idx')),
        migrations.AddIndex(model_name='boatimage', index=models.Index(fields=['boat', 'sort_order', 'id'], name='boatimage_boat_order_idx')),
        migrations.AddIndex(model_name='boatimage', index=models.Index(fields=['boat', '-is_cover', 'sort_order', 'id'], name='boatimage_cover_order_idx')),
    ]
