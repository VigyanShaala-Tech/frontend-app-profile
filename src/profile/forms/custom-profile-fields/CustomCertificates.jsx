import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, useIntl } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@openedx/paragon';

import certificateMessages from '../../Certificates.messages';

const CustomCertificates = ({ certificates }) => {
  const { formatMessage } = useIntl();

  if (!certificates.length) {
    return (
      <p className="mb-0 text-muted">
        {formatMessage({
          id: 'profile.no.certificates',
          defaultMessage: "You don't have any certificates yet.",
        })}
      </p>
    );
  }

  return (
    <div className="custom-certificates-list">
      {certificates.map((certificate) => (
        <div key={`${certificate.courseId}-${certificate.modifiedDate}`} className="custom-certificate-row">
          <div className="custom-certificate-row__content">
            <p className="m-0 color-black h4">{certificate.courseDisplayName}</p>
            <p className="mb-0 small text-muted">
              {formatMessage(
                {
                  id: 'profile.certificate.completion.date.label',
                  defaultMessage: 'Completed on {date}',
                },
                { date: <FormattedDate value={new Date(certificate.modifiedDate)} /> },
              )}
            </p>
          </div>
          <div className="custom-certificate-row__action">
            <Hyperlink
              destination={certificate.downloadUrl}
              target="_blank"
              showLaunchIcon={false}
              className="btn btn-primary font-weight-normal px-4 py-10px"
            >
              {formatMessage(certificateMessages['profile.certificates.view.certificate'])}
            </Hyperlink>
          </div>
        </div>
      ))}
    </div>
  );
};

CustomCertificates.propTypes = {
  certificates: PropTypes.arrayOf(PropTypes.shape({
    courseDisplayName: PropTypes.string,
    modifiedDate: PropTypes.string,
    downloadUrl: PropTypes.string,
    courseId: PropTypes.string.isRequired,
  })),
};

CustomCertificates.defaultProps = {
  certificates: [],
};

export default CustomCertificates;
