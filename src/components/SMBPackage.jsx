import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SMBPackage.css';
import smbImage from '../assets/smb-coffee-shop.jpg';
import smbConstruction from '../assets/smb-construction.jpg';
import smbDentalClinic from '../assets/smb-dental-clinic.jpg';

const SMBPackage = () => {
  // Carousel images - add more images to this array as needed
  const images = [
    { src: smbImage, alt: 'Small business owner in coffee shop' },
    { src: smbConstruction, alt: 'Construction businesses' },
    { src: smbDentalClinic, alt: 'AI for dental offices' },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="smb-package">
      <div className="smb-container">
        <div className="smb-content">
          <h2 className="smb-title">Small Business Packages</h2>
          <p className="smb-description">
            Tailored solutions for growing businesses. Get started with our comprehensive packages designed to help small businesses succeed.
          </p>
          <Link to="/contact" className="smb-cta">
            Let&apos;s talk!
          </Link>
        </div>

        <div className="smb-carousel">
          <div className="carousel-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {images.map((image, index) => (
                <div key={index} className="carousel-slide">
                  <img src={image.src} alt={image.alt} />
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              className="carousel-button carousel-button--prev"
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="carousel-button carousel-button--next"
              onClick={goToNext}
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="carousel-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SMBPackage;
