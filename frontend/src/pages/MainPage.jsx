// MainPage.jsx
import React, { useRef, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../layout/Header.jsx';
import Body from '../layout/Body.jsx';
import CenteredContact from '../layout/Contact.jsx';
import Footer from '../layout/Footer.jsx';

function MainPage() {
    const homeRef = useRef(null);
    const contactRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollToSection = (ref) => {
        if (ref.current) {
            const headerOffset = isMobile ? 80 : 100;
            const elementPosition = ref.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    return (
        <>
            <Header 
                onHomeClick={() => scrollToSection(homeRef)}
            />
            <div ref={homeRef}>
                <Body />
            </div>
            
            <div ref={contactRef}>
                <CenteredContact />
            </div>
            
            <div className="policy-content">
                <Outlet />
            </div>
            
            <Footer />
        </>
    )
}

export default MainPage;