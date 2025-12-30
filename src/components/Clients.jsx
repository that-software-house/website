import React from 'react';
import './Clients.css';
import voxHealthLogo from '../assets/clients/vox-health.svg';
import codeMinderLogo from '../assets/clients/codeminder-purple.svg';
import oracleLogo from '../assets/clients/oracle.png';
import microsoftLogo from '../assets/clients/microsoft.png';
import kaizenHealthLogo from '../assets/clients/kaizen-health.png';
import amex from '../assets/clients/amex.png';

const Clients = () => {
  const clients = [
    { name: 'Vox Health', logo: voxHealthLogo },
    { name: 'Code Minder', logo: codeMinderLogo },
    { name: 'Oracle', logo: oracleLogo },
    { name: 'Kaizen Health', logo: kaizenHealthLogo },
    { name: 'Microsoft', logo: microsoftLogo },
    { name: 'American Express', logo: amex },
  ];

  return (
    <section className="clients-wide">
      <div className="container">
        <h2 className="clients-wide__title">Products we developed are used by</h2>
        <div className="clients-wide__grid">
          {clients.map((client) => (
            <div key={client.name} className="clients-wide__item">
              {client.logo ? <img src={client.logo} alt={client.name} /> : <span>{client.name}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
