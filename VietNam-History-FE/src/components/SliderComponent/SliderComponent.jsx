import React from 'react';
import Slider from "react-slick";
import './SliderComponent.css'; // Đảm bảo bạn đã import file CSS

const SliderComponent = ({ arrImg }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
   // autoplay: true,
    //autoplaySpeed: 2000
  };

  return (
    <Slider {...settings}>
      {arrImg.map((image, index) => (
        <div key={index} className="slider-item">
          <img className="slider-image" src={image} alt="slider" />
        </div>
      ))}
    </Slider>
  );
};

export default SliderComponent;
