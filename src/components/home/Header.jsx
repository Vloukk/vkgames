// src/app/page.jsx
import Link from 'next/link';
import React from 'react';
import Logo from './Logo';

const Header = () => {
  return (
    <div className='header'>
        <div className="header__logo">
            <Logo />
        </div>
        <div className="header__info">
            <div className="info__links">
                <Link href="" >Nous soutenir</Link>
                <Link href="" >Actualités</Link>
                <Link href="" className='connexion button' >
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.3374 0C6.04586 0 4.16545 1.87391 4.16545 4.16544C4.16545 6.45698 6.04586 8.3374 8.3374 8.3374C10.6289 8.3374 12.5012 6.45698 12.5012 4.16544C12.5012 1.87391 10.6289 0 8.3374 0ZM5.00212 9.16756C2.50024 9.16756 0 10.8344 0 13.3314V15.1838C0.158803 16.2258 0.833415 16.6683 1.66846 16.6667H14.9998C15.8349 16.6683 16.3862 15.9712 16.6667 15.1838V13.3314C16.6683 10.001 14.168 9.16756 11.6645 9.16756H5.00212Z" fill="#FFFCE1"/>
                    </svg>
                </Link>
            </div>
        </div>
    </div>
  );
};

export default Header;
