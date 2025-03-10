import React from 'react';
import { shallowEqual } from 'react-redux';

import { Button } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';

import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useLanguage } from 'src/hooks/useLanguage';
import { Triggers } from 'src/layout/common.generated';
import classes from 'src/layout/NavigationButtons/NavigationButtonsComponent.module.css';
import { getLayoutOrderFromTracks, selectLayoutOrder } from 'src/selectors/getLayoutOrder';
import { reducePageValidations } from 'src/types';
import { getNextView } from 'src/utils/formLayout';
import { LayoutPage } from 'src/utils/layout/LayoutPage';
import type { IKeepComponentScrollPos } from 'src/features/layout/formLayoutTypes';
import type { PropsFromGenericComponent } from 'src/layout';
import type { ILayoutNavigation } from 'src/layout/common.generated';
import type { IRuntimeState } from 'src/types';
export type INavigationButtons = PropsFromGenericComponent<'NavigationButtons'>;

export function NavigationButtonsComponent({ node }: INavigationButtons) {
  const { id, showBackButton, textResourceBindings, triggers } = node.item;
  const dispatch = useAppDispatch();
  const { lang } = useLanguage();

  const refPrev = React.useRef<HTMLButtonElement>(null);
  const refNext = React.useRef<HTMLButtonElement>(null);

  const keepScrollPos = useAppSelector((state) => state.formLayout.uiConfig.keepScrollPos);

  const currentView = useAppSelector((state) => state.formLayout.uiConfig.currentView);
  const orderedLayoutKeys = useAppSelector(selectLayoutOrder);
  const returnToView = useAppSelector((state) => state.formLayout.uiConfig.returnToView);
  const pageTriggers = useAppSelector((state) => state.formLayout.uiConfig.pageTriggers);
  const { next, previous } = useAppSelector((state) => getNavigationConfigForCurrentView(state), shallowEqual);
  const activeTriggers = triggers || pageTriggers;
  const nextTextKey = returnToView ? 'form_filler.back_to_summary' : textResourceBindings?.next || 'next';
  const backTextKey = textResourceBindings?.back || 'back';

  const parentIsPage = node.parent instanceof LayoutPage;

  const currentViewIndex = orderedLayoutKeys?.indexOf(currentView);
  const disableBack = !!returnToView || (!previous && currentViewIndex === 0);
  const disableNext = !returnToView && !next && currentViewIndex === (orderedLayoutKeys?.length || 0) - 1;

  const onClickPrevious = () => {
    const goToView = previous || (orderedLayoutKeys && orderedLayoutKeys[orderedLayoutKeys.indexOf(currentView) - 1]);
    if (goToView) {
      dispatch(
        FormLayoutActions.updateCurrentView({
          newView: goToView,
        }),
      );
    }
  };

  const getScrollPosition = React.useCallback(
    () => (refNext.current || refPrev.current)?.getClientRects().item(0)?.y,
    [],
  );

  const OnClickNext = () => {
    const runValidations = reducePageValidations(activeTriggers);
    const keepScrollPosAction: IKeepComponentScrollPos = {
      componentId: id,
      offsetTop: getScrollPosition(),
    };

    if (activeTriggers?.includes(Triggers.CalculatePageOrder)) {
      dispatch(
        FormLayoutActions.calculatePageOrderAndMoveToNextPage({
          runValidations,
          keepScrollPos: keepScrollPosAction,
        }),
      );
    } else {
      const goToView =
        returnToView || next || (orderedLayoutKeys && orderedLayoutKeys[orderedLayoutKeys.indexOf(currentView) + 1]);
      if (goToView) {
        dispatch(
          FormLayoutActions.updateCurrentView({
            newView: goToView,
            runValidations,
            keepScrollPos: keepScrollPosAction,
          }),
        );
      }
    }
  };

  React.useLayoutEffect(() => {
    if (!keepScrollPos || typeof keepScrollPos.offsetTop !== 'number' || keepScrollPos.componentId !== id) {
      return;
    }

    const currentPos = getScrollPosition();
    if (typeof currentPos !== 'number') {
      return;
    }

    window.scrollBy({ top: currentPos - keepScrollPos.offsetTop });
    dispatch(FormLayoutActions.clearKeepScrollPos());
  }, [keepScrollPos, dispatch, id, getScrollPosition]);

  return (
    <div
      data-testid='NavigationButtons'
      className={classes.container}
      style={{ marginTop: parentIsPage ? 'var(--button-margin-top)' : undefined }}
    >
      {!disableBack && showBackButton && (
        <Grid item>
          <Button
            ref={refPrev}
            size='small'
            onClick={onClickPrevious}
            disabled={disableBack}
          >
            {lang(backTextKey)}
          </Button>
        </Grid>
      )}
      {!disableNext && (
        <Grid item>
          <Button
            ref={refNext}
            size='small'
            onClick={OnClickNext}
            disabled={disableNext}
          >
            {lang(nextTextKey)}
          </Button>
        </Grid>
      )}
    </div>
  );
}

function getNavigationConfigForCurrentView(state: IRuntimeState): ILayoutNavigation {
  const currentView = state.formLayout.uiConfig.currentView;
  const navConfig =
    state.formLayout.uiConfig.navigationConfig && state.formLayout.uiConfig.navigationConfig[currentView];
  const order = getLayoutOrderFromTracks(state.formLayout.uiConfig.tracks);

  return {
    previous: getNextView(navConfig, order, currentView, true),
    next: getNextView(navConfig, order, currentView),
  };
}
