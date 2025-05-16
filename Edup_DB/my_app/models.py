from django.db import models

# Create your models here.

class TimeSlot(models.Model):
    time_slot_id = models.AutoField(primary_key=True)
    time_start = models.TimeField()
    time_end = models.TimeField()
    day = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.day} {self.time_start}-{self.time_end}"


class Teacher(models.Model):
    teacher_id = models.AutoField(primary_key=True)
    teacher_name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    teaching_load = models.IntegerField()

    def __str__(self):
        return self.teacher_name


class Subject(models.Model):
    subject_id = models.AutoField(primary_key=True)
    subject_name = models.CharField(max_length=100)

    def __str__(self):
        return self.subject_name


class Section(models.Model):
    section_id = models.AutoField(primary_key=True)
    section_name = models.CharField(max_length=100)
    grade_level = models.IntegerField()

    def __str__(self):
        return f"{self.section_name} (Grade {self.grade_level})"


class Schedule(models.Model):
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    school_year = models.CharField(max_length=9)

    def __str__(self):
        return f"{self.school_year} | {self.section} | {self.time_slot} | {self.subject} - {self.teacher}"


class Advisory(models.Model):
    advisory_id = models.AutoField(primary_key=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    school_year = models.CharField(max_length=9)

    def __str__(self):
        return f"{self.section} - Adviser: {self.teacher} ({self.school_year})"
