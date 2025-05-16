# Create your views here.

from django.shortcuts import render, redirect, get_object_or_404
from .models import TimeSlot, Subject, Section, Teacher, Advisory
from .forms import TimeSlotForm, SubjectForm, SectionForm, TeacherForm, AdvisoryForm

# Create your views here.

def crud_view(request, model, form_class, template_name, instance_id=None, action=None):
    instance = None
    fields = []
    
    if instance_id:
        instance = get_object_or_404(model, pk=instance_id)
    
    if action == 'delete':
        instance.delete()
        return redirect(f'/{model.__name__.lower()}/') 
    
    if request.method == 'POST':
        form = form_class(request.POST, instance=instance)
        if form.is_valid():
            form.save()
            return redirect(f'/{model.__name__.lower()}/')
    else:
        form = form_class(instance=instance)
    
    items = model.objects.all()

    # Dynamically get the fields for the model
    if model == Advisory:
        fields = ['id', 'teacher', 'section', 'school_year']
    else:
        fields = [field.name for field in model._meta.fields]
    
    return render(request, template_name, {
        'form': form, 'items': items, 'model_name': model.__name__, 'fields': fields
    })






# def advisory_view(request, instance_id=None, action=None):
#     instance = None
#     if instance_id:
#         instance = get_object_or_404(Advisory, pk=instance_id)

#     if action == 'delete':
#         instance.delete()
#         return redirect('advisory') 

#     if request.method == 'POST':
#         form = AdvisoryForm(request.POST, instance=instance)
#         if form.is_valid():
#             form.save()
#             return redirect('advisory') 
#     else:
#         form = AdvisoryForm(instance=instance)

#     items = Advisory.objects.select_related('teacher', 'section')
#     return render(request, 'advisory.html', {'form': form, 'items': items})