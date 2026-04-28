from django.db import migrations, models


MAX_LENGTH = 1000


def truncate_review_comments(apps, schema_editor):
    Review = apps.get_model('reviews', 'Review')

    for review in Review.objects.exclude(comment=''):
        comment = review.comment or ''
        if len(comment) > MAX_LENGTH:
            review.comment = comment[:MAX_LENGTH]
            review.save(update_fields=['comment'])


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0003_review_created_at_index'),
    ]

    operations = [
        migrations.RunPython(
            truncate_review_comments,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='review',
            name='comment',
            field=models.CharField(blank=True, max_length=1000),
        ),
    ]