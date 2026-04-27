from django.db import migrations, models
from django.db.models import Q


def normalize_cover_flags(apps, schema_editor):
    BoatListing = apps.get_model('listings', 'BoatListing')
    BoatImage = apps.get_model('listings', 'BoatImage')

    for boat in BoatListing.objects.all().iterator():
        images = list(BoatImage.objects.filter(boat=boat).order_by('sort_order', 'id'))
        if not images:
            continue

        selected = next((img for img in images if img.is_cover), None)

        if selected is None and boat.image:
            selected = next((img for img in images if img.image == boat.image), None)

        if selected is None:
            selected = images[0]

        BoatImage.objects.filter(boat=boat).exclude(id=selected.id).update(is_cover=False)
        if not selected.is_cover:
            BoatImage.objects.filter(id=selected.id).update(is_cover=True)


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0003_boatlisting_created_at_index'),
    ]

    operations = [
        migrations.RunPython(normalize_cover_flags, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='boatlisting',
            name='image',
        ),
        migrations.AddConstraint(
            model_name='boatimage',
            constraint=models.UniqueConstraint(
                fields=('boat',),
                condition=Q(is_cover=True),
                name='unique_cover_image_per_boat',
            ),
        ),
    ]
