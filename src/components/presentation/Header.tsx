import React from 'react';

import { Heading } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import classes from 'src/components/presentation/Header.module.css';
import { Progress } from 'src/components/presentation/Progress';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { selectDisplayAppOwnerNameInHeader } from 'src/selectors/logo';
import { ProcessTaskType } from 'src/types';
import type { PresentationType } from 'src/types';

export interface IHeaderProps {
  type: ProcessTaskType | PresentationType;
  header?: string | React.ReactNode;
  appOwner?: string;
}

export const Header = ({ type, header, appOwner }: IHeaderProps) => {
  const showProgressSettings = useAppSelector((state) => state.formLayout.uiConfig.showProgress);
  const displayAppOwnerNameInHeader = useAppSelector(selectDisplayAppOwnerNameInHeader);
  const showProgress = type !== ProcessTaskType.Archived && showProgressSettings;

  const { lang } = useLanguage();

  return (
    <header className={classes.wrapper}>
      <Grid
        container
        direction='row'
        justifyContent='space-between'
        wrap='nowrap'
        spacing={2}
      >
        <Grid item>
          {!displayAppOwnerNameInHeader && (
            <Grid item>
              <span>{appOwner}</span>
            </Grid>
          )}
          <Grid item>
            <Heading
              level={1}
              size='medium'
              data-testid='presentation-heading'
            >
              {type === ProcessTaskType.Archived ? <span>{lang('receipt.receipt')}</span> : header}
            </Heading>
          </Grid>
        </Grid>
        {showProgress && (
          <Grid
            item
            aria-live='polite'
          >
            <Progress />
          </Grid>
        )}
      </Grid>
    </header>
  );
};
