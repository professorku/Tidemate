from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0009_boatlisting_public_coordinates'),
    ]

    operations = [
        migrations.AlterField(
            model_name='boatlisting',
            name='boat_type',
            field=models.CharField(
                choices=[
                    ('rib', 'RIB'),
                    ('sailboat', 'Sailboat'),
                    ('kayak', 'Kayak'),
                    ('yacht', 'Yacht'),
                    ('motorboat', 'Motorboat'),
                    ('fishing_boat', 'Fishing Boat'),
                    ('rowboat', 'Rowboat'),
                    ('catamaran', 'Catamaran'),
                    ('canoe', 'Canoe'),
                    ('other', 'Other'),
                ],
                max_length=20,
            ),
        ),
    ]