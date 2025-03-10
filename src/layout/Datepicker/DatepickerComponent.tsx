import React from 'react';

import MomentUtils from '@date-io/moment';
import { Grid, makeStyles } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { CalendarIcon } from '@navikt/aksel-icons';
import moment from 'moment';
import type { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

import { useAppSelector } from 'src/hooks/useAppSelector';
import { useDelayedSavedState } from 'src/hooks/useDelayedSavedState';
import { useIsMobile } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { getDateConstraint, getDateFormat, getDateString } from 'src/utils/dateHelpers';
import type { PropsFromGenericComponent } from 'src/layout';

import 'src/layout/Datepicker/DatepickerComponent.css';
import 'src/styles/shared.css';

export type IDatepickerProps = PropsFromGenericComponent<'Datepicker'>;

const useStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'white',
    boxSizing: 'border-box',
    height: '36px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    borderRadius: 'var(--interactive_components-border_radius-normal)',
    marginBottom: '0px',
    outline: '1px solid var(--component-input-color-border-default)',
    '&:hover': {
      outline: '2px solid var(--component-input-color-border-hover)',
    },
    '&:has(input:focus-visible)': {
      outline: 'var(--fds-focus-border-width) solid var(--fds-outer-focus-border-color)',
    },
  },
  input: {
    padding: '0px',
    marginLeft: '12px',
  },
  invalid: {
    outlineColor: `var(--component-input-error-color-border-default)`,
    '&:hover': {
      outlineColor: `var(--component-input-error-color-border-default)`,
    },
  },
  icon: {
    fontSize: '1.75rem',
    color: 'var(--semantic-text-neutral-default)',
  },
  iconButton: {
    padding: 3,
    '&:focus': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: 'var(--fds-focus-border-width) solid var(--fds-outer-focus-border-color)',
      outlineOffset: 'var(--fds-focus-border-width)',
      boxShadow: '0 0 0 var(--fds-focus-border-width) var(--fds-inner-focus-border-color)',
    },
  },
  formHelperText: {
    fontSize: '0.875rem',
  },
  datepicker: {
    width: 'auto',
    marginBottom: '0px',
    marginTop: '0px',
  },
  dialog: {
    '& *': {
      fontFamily: 'inherit',
    },
    '& .MuiTypography-h4': {
      fontSize: '1.5rem',
    },
    '& .MuiTypography-body1': {
      fontSize: '1.125rem',
    },
    '& .MuiTypography-body2': {
      fontSize: '1rem',
    },
    '& .MuiTypography-caption': {
      fontSize: '1rem',
    },
    '& .MuiTypography-subtitle1': {
      fontSize: '1rem',
    },
  },
}));

class AltinnMomentUtils extends MomentUtils {
  getDatePickerHeaderText(date: moment.Moment) {
    if (date && date.locale() === 'nb') {
      return date.format('dddd, D. MMMM');
    }
    return super.getDatePickerHeaderText(date);
  }
}

// We dont use the built-in validation for the 3rd party component, so it is always empty string
const emptyString = '';

export function DatepickerComponent({ node, formData, handleDataChange, isValid, overrideDisplay }: IDatepickerProps) {
  const classes = useStyles();
  const profile = useAppSelector((state) => state.profile);
  const { langAsString } = useLanguage();
  const languageLocale = profile.selectedAppLanguage || profile.profile.profileSettingPreference.language;
  const { minDate, maxDate, format, timeStamp = true, readOnly, required, id, textResourceBindings } = node.item;

  const calculatedMinDate = getDateConstraint(minDate, 'min');
  const calculatedMaxDate = getDateConstraint(maxDate, 'max');

  const calculatedFormat = getDateFormat(format, languageLocale);
  const isMobile = useIsMobile();

  const { value, setValue, saveValue, onPaste } = useDelayedSavedState(handleDataChange, formData?.simpleBinding ?? '');

  const dateValue = moment(value, moment.ISO_8601);
  const [date, input] = dateValue.isValid() ? [dateValue, undefined] : [null, value ?? ''];

  const handleDateValueChange = (
    dateValue: MaterialUiPickersDate,
    inputValue: string | undefined,
    saveImmediately = false,
  ) => {
    if (dateValue?.isValid()) {
      dateValue.set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0);
      setValue(getDateString(dateValue, timeStamp), saveImmediately);
    } else {
      const skipValidation = (dateValue?.parsingFlags().charsLeftOver ?? 0) > 0;
      setValue(inputValue ?? '', saveImmediately, skipValidation);
    }
  };

  const mobileOnlyProps = isMobile
    ? {
        cancelLabel: langAsString('date_picker.cancel_label'),
        clearLabel: langAsString('date_picker.clear_label'),
        todayLabel: langAsString('date_picker.today_label'),
      }
    : {};

  return (
    <>
      <MuiPickersUtilsProvider utils={AltinnMomentUtils}>
        <Grid
          container
          item
          xs={12}
        >
          <KeyboardDatePicker
            readOnly={readOnly}
            required={required}
            variant={isMobile ? 'dialog' : 'inline'}
            format={calculatedFormat}
            margin='normal'
            id={id}
            data-testid={id}
            value={date}
            inputValue={input}
            placeholder={calculatedFormat}
            key={id}
            onChange={handleDateValueChange}
            onBlur={saveValue}
            onAccept={(dateValue) => handleDateValueChange(dateValue, undefined, true)}
            onPaste={onPaste}
            autoOk={true}
            invalidDateMessage={emptyString}
            maxDateMessage={emptyString}
            minDateMessage={emptyString}
            minDate={calculatedMinDate}
            maxDate={calculatedMaxDate}
            InputProps={{
              disableUnderline: true,
              error: !isValid,
              readOnly,
              classes: {
                root: classes.root + (!isValid ? ` ${classes.invalid}` : '') + (readOnly ? ' disabled' : ''),
                input: classes.input,
              },
              ...(textResourceBindings?.description && {
                'aria-describedby': `description-${id}`,
              }),
            }}
            inputProps={{
              className: 'no-visual-testing',
              'aria-label': overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined,
            }}
            DialogProps={{ className: classes.dialog }}
            PopoverProps={{ className: classes.dialog }}
            FormHelperTextProps={{
              classes: {
                root: classes.formHelperText,
              },
            }}
            KeyboardButtonProps={{
              'aria-label': langAsString('date_picker.aria_label_icon'),
              id: 'date-icon-button',
              classes: {
                root: classes.iconButton,
              },
            }}
            leftArrowButtonProps={{
              'aria-label': langAsString('date_picker.aria_label_left_arrow'),
              id: 'date-left-icon-button',
            }}
            rightArrowButtonProps={{
              'aria-label': langAsString('date_picker.aria_label_right_arrow'),
              id: 'date-right-icon-button',
            }}
            keyboardIcon={
              <CalendarIcon
                id='date-icon'
                className={classes.icon}
                aria-label={langAsString('date_picker.aria_label_icon')}
              />
            }
            className={classes.datepicker}
            {...mobileOnlyProps}
          />
        </Grid>
      </MuiPickersUtilsProvider>
    </>
  );
}
