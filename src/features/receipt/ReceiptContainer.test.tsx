import React from 'react';
import { Route, useLocation } from 'react-router-dom';

import { screen } from '@testing-library/react';

import { dataTypes, instanceOwner, partyMember, partyTypesAllowed, userProfile } from 'src/__mocks__/constants';
import { getInstanceDataStateMock } from 'src/__mocks__/instanceDataStateMock';
import { getUiConfigStateMock } from 'src/__mocks__/uiConfigStateMock';
import { ReceiptContainer, returnInstanceMetaDataObject } from 'src/features/receipt/ReceiptContainer';
import { staticUseLanguageForTests } from 'src/hooks/useLanguage';
import { MemoryRouterWithRedirectingRoot } from 'src/test/memoryRouterWithRedirectingRoot';
import { renderWithProviders } from 'src/test/renderWithProviders';
import type { SummaryDataObject } from 'src/components/table/AltinnSummaryTable';
import type { ILayout } from 'src/layout/layout';
import type { IAltinnOrgs, IParty } from 'src/types/shared';

interface IRender {
  populateStore?: boolean;
  autoDeleteOnProcessEnd?: boolean;
  hasPdf?: boolean;
  setCustomReceipt?: boolean;
  receiptLayoutExist?: boolean;
}

const exampleGuid = '75154373-aed4-41f7-95b4-e5b5115c2edc';
const exampleDataGuid = 'c21ebe7a-038d-4e8d-811c-0df1c16a1aa9';
const exampleDataGuid2 = 'afaee8fe-6317-4cc4-ae3a-3c8fcdec40bb';
const exampleInstanceId = `512345/${exampleGuid}`;
const DefinedRoutes = () => {
  const HeaderElement = () => {
    const { pathname } = useLocation();
    return <p>Location: {pathname}</p>;
  };
  return (
    <>
      <MemoryRouterWithRedirectingRoot
        to={`instance/${exampleInstanceId}`}
        element={<HeaderElement />}
      >
        <Route
          path={'instance/:partyId/:instanceGuid'}
          element={<ReceiptContainer />}
        />
      </MemoryRouterWithRedirectingRoot>
    </>
  );
};

function getMockState({
  autoDeleteOnProcessEnd = false,
  hasPdf = true,
  setCustomReceipt = false,
  receiptLayoutExist = false,
}) {
  const pdfData = hasPdf
    ? [
        {
          id: exampleDataGuid,
          instanceGuid: exampleGuid,
          dataType: 'ref-data-as-pdf',
          filename: 'UI komponents App.pdf',
          contentType: 'application/pdf',
          blobStoragePath: `ttd/ui-components/${exampleGuid}/data/${exampleDataGuid}`,
          selfLinks: {
            apps: `https://local.altinn.cloud/ttd/ui-components/instances/${exampleInstanceId}/data/${exampleDataGuid}`,
            platform: `https://platform.local.altinn.cloud/storage/api/v1/instances/${exampleInstanceId}/data/${exampleDataGuid}`,
          },
          size: 15366,
          locked: false,
          refs: [],
          isRead: true,
          created: '2022-02-05T09:19:32.8710001Z' as any,
          createdBy: '12345',
          lastChanged: '2022-02-05T09:19:32.8710001Z' as any,
          lastChangedBy: '12345',
        },
      ]
    : [];

  const receipt: ILayout = [
    {
      id: 'ReceiptHeader',
      type: 'Header',
      textResourceBindings: {
        title: 'receipt.title',
      },
      size: 'h2',
    },
    {
      id: 'ReceiptParagraph',
      type: 'Paragraph',
      textResourceBindings: {
        title: 'receipt.body',
      },
    },
    {
      id: 'ReceiptInstanceInformation',
      type: 'InstanceInformation',
    },
    {
      id: 'ReceiptAttachmentList',
      type: 'AttachmentList',
      dataTypeIds: ['ref-data-as-pdf'],
      includePDF: true,
    },
  ];

  const receiptLayout = receiptLayoutExist ? { receipt } : {};

  const customReceipt = setCustomReceipt ? { receiptLayoutName: 'receipt' } : {};

  return {
    organisationMetaData: {
      allOrgs: {
        brg: {
          name: {
            en: 'Brønnøysund Register Centre',
            nb: 'Brønnøysundregistrene',
            nn: 'Brønnøysundregistera',
          },
          logo: 'https://altinncdn.no/orgs/brg/brreg.png',
          orgnr: '974760673',
          homepage: 'https://www.brreg.no',
          environments: ['tt02', 'production'],
        },
      },
    },
    applicationMetadata: {
      applicationMetadata: {
        id: 'ttd/ui-components',
        org: 'ttd',
        title: {
          nb: 'App frontend komponenter',
          en: 'App frontend components',
        },
        dataTypes,
        partyTypesAllowed,
        autoDeleteOnProcessEnd,
        created: '2020-03-02T07:32:53.8640778Z',
        createdBy: 'jeeva',
        lastChanged: '2020-03-02T07:32:53.8641776Z',
        lastChangedBy: 'jeeva',
      },
    },
    formLayout: {
      uiConfig: {
        ...getUiConfigStateMock(),
        ...customReceipt,
      },
      layouts: {
        ...receiptLayout,
      },
    },
    instanceData: {
      instance: {
        ...getInstanceDataStateMock().instance,
        id: exampleInstanceId,
        instanceOwner,
        org: 'ttd',
        data: [
          {
            id: '${exampleDataGuid2}',
            instanceGuid: exampleGuid,
            dataType: 'default',
            filename: null,
            contentType: 'application/xml',
            blobStoragePath: `ttd/ui-components/${exampleGuid}/data/${exampleDataGuid2}`,
            selfLinks: {
              apps: `https://local.altinn.cloud/ttd/ui-components/instances/${exampleInstanceId}/data/${exampleDataGuid2}`,
              platform: `https://platform.local.altinn.cloud/storage/api/v1/instances/${exampleInstanceId}/data/${exampleDataGuid2}`,
            },
            size: 1254,
            locked: true,
            refs: [],
            isRead: true,
            created: '2022-02-05T09:19:32.5897421Z' as any,
            createdBy: '12345',
            lastChanged: '2022-02-05T09:19:32.5897421Z' as any,
            lastChangedBy: '12345',
          },
          ...pdfData,
        ],
        lastChanged: '2022-02-05T09:19:32.8858042Z' as any,
      },
    },
    language: {
      language: {},
    },
    party: {
      parties: [partyMember],
    },
    profile: {
      profile: userProfile,
    },
  } as any;
}

const render = ({
  populateStore = true,
  autoDeleteOnProcessEnd = false,
  hasPdf = true,
  setCustomReceipt = false,
  receiptLayoutExist = false,
}: IRender = {}) => {
  const mockState = getMockState({ hasPdf, autoDeleteOnProcessEnd, setCustomReceipt, receiptLayoutExist });
  renderWithProviders(<DefinedRoutes />, {
    preloadedState: populateStore ? mockState : {},
  });
};

describe('ReceiptContainer', () => {
  it('should show loader when not all data is loaded', () => {
    render({ populateStore: false });

    expect(
      screen.getByRole('img', {
        name: /loading\.\.\./i,
      }),
    ).toBeInTheDocument();
  });

  it('should show download link to pdf when all data is loaded, and data includes pdf', () => {
    render();

    expect(
      screen.queryByRole('img', {
        name: /Laster/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Skjema er sendt inn',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Følgende er sendt inn:/,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /ui komponents app\.pdf/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /Kopi av din kvittering er sendt til ditt arkiv/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole('link').length).toBe(2);
  });

  it('should not show download link to pdf when all data is loaded, and data does not include pdf', () => {
    render({ hasPdf: false });

    expect(
      screen.queryByRole('img', {
        name: /Laster/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: /Skjema er sendt inn/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: /Kopi av din kvittering er sendt til ditt arkiv/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getAllByRole('link').length).toBe(1);
  });

  it('should show complex receipt when autoDeleteOnProcessEnd is false', () => {
    render();

    expect(
      screen.queryByText(
        /Av sikkerhetshensyn vil verken innholdet i tjenesten eller denne meldingen være synlig i Altinn etter at du har forlatt denne siden/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('should show simple receipt when autoDeleteOnProcessEnd is true', () => {
    render({ autoDeleteOnProcessEnd: true });

    expect(
      screen.getByText(
        /Av sikkerhetshensyn vil verken innholdet i tjenesten eller denne meldingen være synlig i Altinn etter at du har forlatt denne siden/i,
      ),
    ).toBeInTheDocument();
  });

  it('should show custom receipt when receiptLayoutName is found in uiConfig and the layout exists', () => {
    render({ setCustomReceipt: true, receiptLayoutExist: true });

    expect(screen.getByTestId('custom-receipt')).toBeInTheDocument();
  });

  it('should not show custom receipt when receiptLayoutName is found in uiConfig but the layout does not exists', () => {
    render({ setCustomReceipt: true });

    expect(screen.getByTestId('altinn-receipt')).toBeInTheDocument();
  });

  it('should not show custom receipt when receiptLayoutName not is found in uiConfig but the layout exists', () => {
    render({ receiptLayoutExist: true });

    expect(screen.getByTestId('altinn-receipt')).toBeInTheDocument();
  });
});

describe('returnInstanceMetaDataObject', () => {
  it('should return correct object', () => {
    const testData = {
      orgsData: {
        tdd: {
          name: {
            en: 'Test Ministry',
            nb: 'Testdepartementet',
            nn: 'Testdepartementet',
          },
          logo: '',
          orgnr: '',
          homepage: '',
        },
        ttd: {
          name: {
            en: 'Test Ministry',
            nb: 'Testdepartementet',
            nn: 'Testdepartementet',
          },
          logo: '',
          orgnr: '',
          homepage: '',
        },
      },
      languageData: {},
      textResources: {},
      profileData: {
        profile: {
          userId: 1,
          userName: 'OlaNordmann',
          phoneNumber: '90012345',
          email: 'ola@altinncore.no',
          partyId: 50001,
          party: {
            partyId: 50001,
            partyTypeName: 1,
            orgNumber: null,
            ssn: null,
            unitType: null,
            name: 'Ola Privatperson',
            isDeleted: false,
            onlyHierarchyElementWithNoAccess: false,
            person: {
              ssn: '01017512345',
              name: null,
              firstName: 'Ola',
              middleName: null,
              lastName: 'Privatperson',
              telephoneNumber: null,
              mobileNumber: null,
              mailingAddress: null,
              mailingPostalCode: null,
              mailingPostalCity: null,
              addressMunicipalNumber: null,
              addressMunicipalName: null,
              addressStreetName: null,
              addressHouseNumber: null,
              addressHouseLetter: null,
              addressPostalCode: null,
              addressCity: null,
            },
            organisation: null,
          },
          userType: 1,
          profileSettingPreference: null,
        },
      },
      instanceGuid: '6697de17-18c7-4fb9-a428-d6a414a797ae',
      userLanguageString: 'nb',
      lastChangedDateTime: '22.08.2019 / 09:08',
      instance: {
        org: 'tdd',
      },
      instanceOwnerParty: {
        partyId: 50001,
        name: 'Ola Privatperson',
        ssn: '01017512345',
      },
    };
    const langTools = staticUseLanguageForTests({
      textResources: testData.textResources,
      language: testData.languageData,
      selectedAppLanguage: testData.userLanguageString,
    });

    const expected: SummaryDataObject = {
      'receipt.date_sent': {
        value: '22.08.2019 / 09:08',
        hideFromVisualTesting: true,
      },
      'receipt.receiver': {
        value: 'Testdepartementet',
      },
      'receipt.ref_num': {
        value: 'd6a414a797ae',
        hideFromVisualTesting: true,
      },
      'receipt.sender': {
        value: '01017512345-Ola Privatperson',
      },
    };

    expect(
      returnInstanceMetaDataObject(
        testData.orgsData as unknown as IAltinnOrgs,
        langTools,
        testData.instanceOwnerParty as unknown as IParty,
        testData.instanceGuid,
        testData.lastChangedDateTime,
        testData.instance.org,
      ),
    ).toEqual(expected);
  });
});
