from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0005_review_rating_constraint'),
    ]

    operations = [
        migrations.AddIndex(model_name='review', index=models.Index(fields=['boat', '-created_at', '-id'], name='review_boat_recent_idx')),
        migrations.AddIndex(model_name='review', index=models.Index(fields=['reviewed_user', '-created_at', '-id'], name='review_user_recent_idx')),
        migrations.AddIndex(model_name='review', index=models.Index(fields=['reviewer', '-created_at', '-id'], name='review_reviewer_recent_idx')),
        migrations.AddIndex(model_name='review', index=models.Index(fields=['booking', 'reviewer', 'review_type'], name='review_booking_reviewer_idx')),
    ]
