# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-16 08:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shareWear', '0017_social_media_profile'),
    ]

    operations = [
        migrations.CreateModel(
            name='tag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('word', models.CharField(max_length=35)),
            ],
        ),
        migrations.RemoveField(
            model_name='outfit',
            name='tags',
        ),
        migrations.AddField(
            model_name='outfit',
            name='tag_list',
            field=models.ManyToManyField(to='shareWear.tag'),
        ),
    ]
