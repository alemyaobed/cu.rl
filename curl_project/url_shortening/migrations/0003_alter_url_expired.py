# Generated by Django 4.2.11 on 2024-05-13 14:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('url_shortening', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='url',
            name='expired',
            field=models.BooleanField(default=False, help_text='Designates whether the shortened slug is expired or not.', verbose_name='Expiry status'),
        ),
    ]
