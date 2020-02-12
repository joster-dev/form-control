import { Component, forwardRef, Input, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, Validator, ControlValueAccessor, ValidationErrors } from '@angular/forms';
import { FormControlService } from '../form-control.service';

@Component({
  selector: 'fc-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss', '../styles.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TextComponent),
      multi: true
    }
  ]
})
export class TextComponent implements ControlValueAccessor, Validator {
  @Input() showIcon = this.formControlService.showIcon;
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() minlength = 0;
  @Input() maxlength = 100;
  @Input() required = false;
  @Input() autocapitalize: 'none' | 'sentences' | 'words' | 'characters' = 'none';
  @Input() spellcheck: 'true' | 'false' | 'default' = 'false';

  @ViewChild('textarea', { static: true }) textareaElement!: ElementRef;
  @ViewChild('textareaHidden', { static: true }) textareaHiddenElement!: ElementRef;

  isDisabled = false;
  textareaHeight = 'auto';
  error?: 'required' | 'maxlength' | 'minlength';

  constructor(private formControlService: FormControlService, private renderer: Renderer2) { }

  _model: string | null = null;
  get model() {
    return this._model;
  }
  set model(value: string | null) {
    value = value === null ? '' : value;
    this._model = value === '' ? null : value;
    this.onChange(this._model);
    setTimeout(() => this.setTextareaHeight());
  }

  setTextareaHeight() {
    const textarea = this.textareaElement.nativeElement as HTMLElement;
    const textareaHidden = this.textareaHiddenElement.nativeElement as HTMLElement;
    this.renderer.setStyle(textareaHidden, 'width', `calc(${textarea.scrollWidth}px - 1em)`);
    this.renderer.setStyle(textareaHidden, 'height', 'auto');
    this.renderer.setStyle(textarea, 'height', `${textareaHidden.scrollHeight}px`);
  }

  onChange(_model: string | null) { }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onTouched() { }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  validate(): ValidationErrors | null {
    if (this._model === null && this.required === true) {
      this.error = 'required';
      return { required: true };
    }

    if (this._model !== null && this._model.length > this.maxlength) {
      this.error = 'maxlength';
      return { maxlength: true };
    }

    if ((this._model === null ? '' : this._model).length < this.minlength) {
      this.error = 'minlength';
      return { minlength: true };
    }

    this.error = undefined;
    return null;
  }

  writeValue(value: any): void {
    if (value !== null && typeof value !== 'string') {
      throw new Error('control value must be string or null');
    }

    this._model = value;
    setTimeout(() => this.setTextareaHeight());
  }
}
