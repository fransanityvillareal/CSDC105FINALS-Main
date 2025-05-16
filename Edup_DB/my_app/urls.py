from django.urls import path
from . import views

urlpatterns = [
    path('timeslot/', views.crud_view, {'model': views.TimeSlot, 'form_class': views.TimeSlotForm, 'template_name': 'generic_crud.html'}, name='timeslot'),
    path('timeslot/edit/<int:instance_id>/', views.crud_view, {'model': views.TimeSlot, 'form_class': views.TimeSlotForm, 'template_name': 'generic_crud.html'}, name='time_slot_edit'),
    path('timeslot/delete/<int:instance_id>/', views.crud_view, {'model': views.TimeSlot, 'form_class': views.TimeSlotForm, 'template_name': 'generic_crud.html', 'action': 'delete'}, name='time_slot_delete'),

    path('subject/', views.crud_view, {'model': views.Subject, 'form_class': views.SubjectForm, 'template_name': 'generic_crud.html'}, name='subject'),
    path('subject/edit/<int:instance_id>/', views.crud_view, {'model': views.Subject, 'form_class': views.SubjectForm, 'template_name': 'generic_crud.html'}, name='subject_edit'),
    path('subject/delete/<int:instance_id>/', views.crud_view, {'model': views.Subject, 'form_class': views.SubjectForm, 'template_name': 'generic_crud.html', 'action': 'delete'}, name='subject_delete'),

    path('section/', views.crud_view, {'model': views.Section, 'form_class': views.SectionForm, 'template_name': 'generic_crud.html'}, name='section'),
    path('section/edit/<int:instance_id>/', views.crud_view, {'model': views.Section, 'form_class': views.SectionForm, 'template_name': 'generic_crud.html'}, name='section_edit'),
    path('section/delete/<int:instance_id>/', views.crud_view, {'model': views.Section, 'form_class': views.SectionForm, 'template_name': 'generic_crud.html', 'action': 'delete'}, name='section_delete'),

    path('teacher/', views.crud_view, {'model': views.Teacher, 'form_class': views.TeacherForm, 'template_name': 'generic_crud.html'}, name='teacher'),
    path('teacher/edit/<int:instance_id>/', views.crud_view, {'model': views.Teacher, 'form_class': views.TeacherForm, 'template_name': 'generic_crud.html'}, name='teacher_edit'),
    path('teacher/delete/<int:instance_id>/', views.crud_view, {'model': views.Teacher, 'form_class': views.TeacherForm, 'template_name': 'generic_crud.html', 'action': 'delete'}, name='teacher_delete'),

    path('advisory/', views.crud_view, {'model': views.Advisory, 'form_class': views.AdvisoryForm, 'template_name': 'generic_crud.html'}, name='advisory'),
    path('advisory/edit/<int:instance_id>/', views.crud_view, {'model': views.Advisory, 'form_class': views.AdvisoryForm, 'template_name': 'generic_crud.html'}, name='advisory_edit'),
    path('advisory/delete/<int:instance_id>/', views.crud_view, {'model': views.Advisory, 'form_class': views.AdvisoryForm, 'template_name': 'generic_crud.html', 'action': 'delete'}, name='advisory_delete'),
]
