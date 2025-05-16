from django import forms
from .models import TimeSlot, Subject, Section, Teacher, Advisory

class TimeSlotForm(forms.ModelForm):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = '__all__'

class SectionForm(forms.ModelForm):
    class Meta:
        model = Section
        fields = '__all__'

class TeacherForm(forms.ModelForm):
    class Meta:
        model = Teacher
        fields = '__all__'

class AdvisoryForm(forms.ModelForm):
    class Meta:
        model = Advisory
        fields = '__all__'

