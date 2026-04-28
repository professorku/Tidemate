from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0004_review_comment_max_length'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='review',
            constraint=models.CheckConstraint(
                condition=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name='review_rating_range',
            ),
        ),
    ]