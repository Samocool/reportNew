'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type ReportEntry, type EntryType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useEffect } from 'react';

interface FormValues {
  entryType: EntryType;
  date: string;
  hours?: number;
  minutes?: number;
  contactName?: string;
  contactPhone?: string;
  contactAddress?: string;
  nextVisitDate?: string;
  nextVisitTime?: string;
  pastInteractionData?: string;
  territory?: string;
}

const formSchema = z.object({
  entryType: z.enum(['house-to-house', 'bible-study', 'return-visit']),
  date: z.string().min(1, 'Date is required.'),
  hours: z.any().optional(),
  minutes: z.any().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  nextVisitDate: z.string().optional(),
  nextVisitTime: z.string().optional(),
  pastInteractionData: z.string().optional(),
  territory: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.entryType === 'bible-study' || data.entryType === 'return-visit') {
        if (!data.contactName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['contactName'],
                message: 'Contact name is required.',
            });
        }
        if (!data.contactAddress) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['contactAddress'],
                message: 'Contact address is required.',
            });
        }
        if (!data.nextVisitDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['nextVisitDate'],
                message: 'Next visit date is required.',
            });
        }
        if (!data.nextVisitTime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['nextVisitTime'],
                message: 'Next visit time is required.',
            });
        }
    }
}).superRefine((data, ctx) => {
    const hours = Number(data.hours) || 0;
    const minutes = Number(data.minutes) || 0;
    if ((data.entryType === 'house-to-house' || data.entryType === 'bible-study') && (hours + minutes <= 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['minutes'],
            message: 'Total time must be greater than 0.',
        });
    }
}).superRefine((data, ctx) => {
    if (data.entryType === 'house-to-house') {
        if (!data.territory) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['territory'],
                message: 'Territory/Street is required.',
            });
        }
    }
});

interface ReportEntryFormProps {
  onSubmit: (data: ReportEntry) => void;
  onCancel: () => void;
  entry?: ReportEntry | null;
  defaultEntryType?: EntryType;
}

export function ReportEntryForm({ onSubmit, onCancel, entry, defaultEntryType }: ReportEntryFormProps) {
  const t = (text: string) => text;
  
  const defaultValues: FormValues = entry ? {
      entryType: entry.entryType,
      date: entry.date,
      hours: Math.floor(entry.minutes / 60),
      minutes: entry.minutes % 60,
      contactName: entry.contactName,
      contactPhone: entry.contactPhone,
      contactAddress: entry.contactAddress,
      nextVisitDate: entry.nextVisitDate,
      nextVisitTime: entry.nextVisitTime,
      pastInteractionData: entry.pastInteractionData,
      territory: entry.territory,
    } : {
      entryType: defaultEntryType || 'house-to-house',
      date: new Date().toISOString().split('T')[0],
      hours: 1,
      minutes: 0,
      contactName: '',
      contactPhone: '',
      contactAddress: '',
      nextVisitDate: '',
      nextVisitTime: '',
      pastInteractionData: '',
      territory: '',
    };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
    mode: 'onChange',
  });
  
  useEffect(() => {
    const newDefaultValues: FormValues = entry ? {
        entryType: entry.entryType,
        date: entry.date,
        hours: Math.floor(entry.minutes / 60),
        minutes: entry.minutes % 60,
        contactName: entry.contactName,
        contactPhone: entry.contactPhone,
        contactAddress: entry.contactAddress,
        nextVisitDate: entry.nextVisitDate,
        nextVisitTime: entry.nextVisitTime,
        pastInteractionData: entry.pastInteractionData,
        territory: entry.territory,
    } : {
        entryType: defaultEntryType || 'house-to-house',
        date: new Date().toISOString().split('T')[0],
        hours: 1,
        minutes: 0,
        contactName: '',
        contactPhone: '',
        contactAddress: '',
        nextVisitDate: '',
        nextVisitTime: '',
        pastInteractionData: '',
        territory: '',
    };
    form.reset(newDefaultValues);
  }, [entry, form, defaultEntryType]);

  const entryType = form.watch('entryType');

  function onFormSubmit(values: FormValues) {
    const totalMinutes = (values.entryType === 'house-to-house' || values.entryType === 'bible-study') ? (Number(values.hours) || 0) * 60 + (Number(values.minutes) || 0) : 0;
    const newEntry: ReportEntry = {
      id: entry?.id || new Date().toISOString() + Math.random(),
      entryType: values.entryType,
      date: values.date,
      minutes: totalMinutes,
      contactName: values.contactName || '',
      contactAddress: values.contactAddress || '',
      contactPhone: values.contactPhone || '',
      nextVisitDate: values.nextVisitDate || '',
      nextVisitTime: values.nextVisitTime || '',
      pastInteractionData: values.pastInteractionData || '',
      territory: values.territory || '',
    };
    onSubmit(newEntry);
    form.reset();
  }

  const getAvailableEntryTypes = (): {value: EntryType, label: string}[] => {
    const allTypes = [
        { value: 'house-to-house' as EntryType, label: 'House to House' },
        { value: 'return-visit' as EntryType, label: 'Return Visit' },
        { value: 'bible-study' as EntryType, label: 'Bible Study' },
    ];

    if (!entry) {
        return allTypes;
    }

    if (entry.entryType === 'house-to-house') {
        return [
            { value: 'house-to-house' as EntryType, label: 'House to House' },
        ];
    }
    
    if (entry.entryType === 'return-visit') {
        return [
            { value: 'return-visit' as EntryType, label: 'Return Visit' },
            { value: 'bible-study' as EntryType, label: 'Bible Study' },
        ];
    }
    
    if (entry.entryType === 'bible-study') {
        return [
            { value: 'bible-study' as EntryType, label: 'Bible Study' },
        ];
    }

    return allTypes;
  }

  const availableEntryTypes = getAvailableEntryTypes();

  return (
    <Form>
      <form onSubmit={form.handleSubmit(onFormSubmit as any)} className="space-y-4">
        <Controller
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('Entry Type')}</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onChange={field.onChange}
                  className="flex flex-wrap gap-x-4 gap-y-2"
                >
                  {availableEntryTypes.map((type) => (
                    <FormItem key={type.value} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={type.value} />
                      </FormControl>
                      <FormLabel className="font-normal">{t(type.label)}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage>{form.formState.errors.entryType?.message}</FormMessage>
            </FormItem>
          )}
        />
        
        { entryType === 'house-to-house' && (
            <Controller control={form.control} name="territory" render={({ field }) => (
              <FormItem><FormLabel>{t('Territory/Street')}</FormLabel><FormControl><Input placeholder={t('e.g. Oak Street')} {...field} /></FormControl><FormMessage>{form.formState.errors.territory?.message}</FormMessage></FormItem>
            )} />
        )}

        <Controller control={form.control} name="date" render={({ field }) => (
          <FormItem><FormLabel>{t('Date')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage>{form.formState.errors.date?.message}</FormMessage></FormItem>
        )} />
        
        { (entryType === 'house-to-house' || entryType === 'bible-study') && (
            <div className="grid grid-cols-2 gap-4">
              <Controller control={form.control} name="hours" render={({ field }) => (
                <FormItem><FormLabel>{t('Hours')}</FormLabel><FormControl><Input type="number" step="1" {...field} value={field.value ?? 0} /></FormControl><FormMessage>{form.formState.errors.hours?.message}</FormMessage></FormItem>
              )} />
              <Controller control={form.control} name="minutes" render={({ field }) => (
                <FormItem><FormLabel>{t('Minutes')}</FormLabel><FormControl><Input type="number" step="1" {...field} value={field.value ?? 0} /></FormControl><FormMessage>{form.formState.errors.minutes?.message}</FormMessage></FormItem>
              )} />
            </div>
        )}

        {(entryType === 'bible-study' || entryType === 'return-visit') && (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <Controller control={form.control} name="contactName" render={({ field }) => (
                      <FormItem><FormLabel>{t('Contact Name')}</FormLabel><FormControl><Input placeholder={t('e.g. Jane Doe')} {...field} /></FormControl><FormMessage>{form.formState.errors.contactName?.message}</FormMessage></FormItem>
                    )} />
                    <Controller control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem><FormLabel>{t('Contact Phone')}</FormLabel><FormControl><Input placeholder={t('e.g. 555-123-4567')} {...field} /></FormControl><FormMessage>{form.formState.errors.contactPhone?.message}</FormMessage></FormItem>
                    )} />
                </div>
                <Controller control={form.control} name="contactAddress" render={({ field }) => (
                  <FormItem><FormLabel>{t('Contact Address')}</FormLabel><FormControl><Textarea placeholder={t('e.g. 123 Main St, Anytown, USA')} {...field} /></FormControl><FormMessage>{form.formState.errors.contactAddress?.message}</FormMessage></FormItem>
                )} />
                <Controller control={form.control} name="pastInteractionData" render={({ field }) => (
                  <FormItem><FormLabel>{t('Past Interactions')}</FormLabel><FormControl><Textarea placeholder={t('Notes from previous visits...')} {...field} /></FormControl><FormMessage>{form.formState.errors.pastInteractionData?.message}</FormMessage></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <Controller control={form.control} name="nextVisitDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Next Visit Date')}</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage>{form.formState.errors.nextVisitDate?.message}</FormMessage>
                    </FormItem>
                  )} />
                  <Controller control={form.control} name="nextVisitTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Next Visit Time')}</FormLabel>
                        <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage>{form.formState.errors.nextVisitTime?.message}</FormMessage>
                    </FormItem>
                  )} />
                </div>
            </>
        )}
        <div className="flex justify-end gap-2 pt-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" disabled={!form.formState.isValid}>{entry ? t('Save Changes') : t('Add Entry')}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('Confirm Submission')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('Are you sure you want to save this entry?')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={form.handleSubmit(onFormSubmit as any)}>{t('Confirm')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="ghost" onClick={onCancel}>
                {t('Cancel')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
