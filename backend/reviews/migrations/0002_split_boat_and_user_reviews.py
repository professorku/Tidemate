from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


def backfill_review_type(apps, schema_editor):
    Review = apps.get_model('reviews', 'Review')

    for review in Review.objects.all().iterator():
        if review.role == 'host':
            review.review_type = 'boat'
            review.role = 'boat'
            review.reviewed_user_id = None
        else:
            review.review_type = 'user'
        review.save(update_fields=['review_type', 'role', 'reviewed_user'])


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='review_type',
            field=models.CharField(
                choices=[('boat', 'Boat'), ('user', 'User')],
                default='user',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='review',
            name='reviewed_user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='reviews_received',
                to='auth.user',
            ),
        ),
        migrations.AlterField(
            model_name='review',
            name='role',
            field=models.CharField(
                blank=True,
                choices=[('boat', 'Boat'), ('host', 'Host'), ('renter', 'Renter')],
                max_length=20,
                null=True,
            ),
        ),
        migrations.RunPython(backfill_review_type, migrations.RunPython.noop),
        migrations.RemoveConstraint(
            model_name='review',
            name='unique_review_per_direction_per_booking',
        ),
        migrations.AddConstraint(
            model_name='review',
            constraint=models.UniqueConstraint(
                condition=Q(review_type='boat'),
                fields=('booking', 'reviewer', 'boat', 'review_type'),
                name='unique_boat_review_per_booking',
            ),
        ),
        migrations.AddConstraint(
            model_name='review',
            constraint=models.UniqueConstraint(
                condition=Q(review_type='user'),
                fields=('booking', 'reviewer', 'reviewed_user', 'review_type'),
                name='unique_user_review_per_direction_per_booking',
            ),
        ),
    ]