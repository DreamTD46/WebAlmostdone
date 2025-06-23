import React, { useState, useEffect, useRef } from 'react';

const TRIVIA_DATA = [
    {
        title: "Particle Count (จำนวนอนุภาค)",
        description: [
            "หมายถึงการนับจำนวนอนุภาคฝุ่น โดยไม่คำนึงถึงขนาดหรือน้ำหนัก",
            "วัดเป็นหน่วย particles/m³ หรือ particles/cm³",
            "เหมาะสำหรับการติดตามอนุภาคขนาดเล็กมาก เช่น ultrafine particles",
            "ใช้เทคนิค optical particle counting หรือ condensation particle counting"
        ]
    },
    {
        title: "Particle Matter (มวลอนุภาค)",
        description: [
            "หมายถึงมวลรวมของอนุภาคฝุ่นที่ลอยอยู่ในอากาศ",
            "วัดเป็นหน่วย μg/m³ (ไมโครกรัมต่อลูกบาศก์เมตร)",
            "แบ่งตามขนาดอนุภาค เช่น PM2.5, PM10",
            "เหมาะสำหรับประเมินผลกระทบต่อสุขภาพและการกำหนดมาตรฐานคุณภาพอากาศ"
        ]
    },
    {
        title: "ความแตกต่างสำคัญ",
        description: [
            "อนุภาคขนาดเล็กจำนวนมากอาจมีมวลรวมน้อย แต่มี particle count สูง",
            "อนุภาคขนาดใหญ่จำนวนน้อยอาจมีมวลรวมมาก แต่มี particle count ต่ำ",
            "การวัด particle matter มักใช้ในการกำกับดูแลสิ่งแวดล้อมและสาธารณสุข",
            "การวัด particle count มักใช้ในงานวิจัยและการประเมินแหล่งกำเนิดมลพิษ"
        ]
    },
    {
        title: "PM2.5 (ฝุ่นละอองขนาดเล็ก ≤ 2.5 ไมโครเมตร)",
        description: [
            "ฝุ่น PM2.5 คือฝุ่นละอองที่ลอยอยู่ในอากาศโดยวัดเส้นผ่านศูนย์กลางได้ 2.5 ไมโครเมตรหรือน้อยกว่านั้น PM2.5 มีขนาดเล็กมากกระทั่งมันสามารถถูกดูดซึมเข้าไปในกระแสเลือดได้เมื่อสูดหายใจเข้าไป ด้วยเหตุนี้ มันจึงเป็นสารมลพิษที่เป็นภัยต่อสุขภาพมากที่สุด",
            "แหล่งที่มาของมันอาจถูกส่งออกมาจากแหล่งที่มนุษย์สร้างขึ้นหรือแหล่งที่มาตามธรรมชาติก็ได้ หรืออาจถูกสร้างขึ้นโดยสารมลพิษอื่น การเผาไหม้ที่เป็นผลมาจากโรงงานพลังงาน ควันและเขม่าจากไฟป่าและการเผาขยะ การปล่อยมลพิษจากรถยนต์และการเผาไหม้จากมอเตอร์ กระบวนการทางอุตสาหกรรมที่เกี่ยวข้องกับปฏิกิริยาทางเคมีระหว่างก๊าซ(ซัลเฟอร์ไดออกไซด์ ไนโตรเจนออกไซด์ และสารประกอบอินทรีย์ระเหย)",
            "ผลกระทบระยะสั้น: การระคายเคืองต่อดวงตา คอ และจมูก, การเต้นของหัวใจที่ผิดปกติ, โรคหอบหืด, การไอ อาการแน่นหน้าอก และอาการหายใจลำบาก",
            "ผลกระทบระยะยาว: การอุดตันของเส้นโลหิตที่ไปเลี้ยงสมอง, การเสียชีวิตก่อนวัยอันควร, โรคระบบทางเดินหายใจ เช่น โรคหลอดลมอักเสบ โรคหอบหืด โรคถุงลมโป่งพอง, ความเสียหายต่อเนื้อเยื่อปอด, มะเร็ง, โรคหัวใจ"
        ]
    },
    {
        title: "PM10 (อนุภาคหยาบ ≤ 10 ไมครอน)",
        description: [
            "PM10 คือฝุ่นละอองแขวนลอยในอากาศที่มีเส้นผ่านศูนย์กลาง 10 ไมโครเมตรหรือน้อยกว่า (รวมถึงควัน เขม่าควัน เกลือ กรด และโลหะ) ความแตกการอยู่ในขนาดของมัน PM10 นั้นหยาบและใหญ่กว่า PM2.5",
            "ฝุ่นผงจากการก่อสร้าง การถมที่ และเกษตรกรรม ฝุ่นผงที่ปลิวจากที่เปิด ควันจากไฟป่าและการเผาขยะ ปฏิกิริยาทางเคมีจากอุตสาหกรรม รถยนต์",
            "ผลกระทบระยะสั้น: อาการหายใจลำบาก, อาการเจ็บหน้าอก, อาการอึดอัดในระบบทางเดินหายใจทั่วไป, อาการเจ็บคอ, อาการคัดจมูก",
            "ผลกระทบระยะยาว: ความเสียหายของเนื้อเยื่อปอด, อาการหอบหืด, การเสียชีวิตก่อนวัยอันควร"
        ]
    },
    {
        title: "Hourly Mean PC0.1 (ค่าเฉลี่ยรายชั่วโมงของอนุภาคขนาดเล็ก)",
        description: [
            "ค่าเฉลี่ยรายชั่วโมงของจำนวนอนุภาคขนาดเล็ก (PC0.1) วัดเป็นอนุภาคต่อลูกบาศก์เซนติเมตร (PNC) หากระดับต่ำกว่า 20,000 อนุภาค/ลูกบาศก์เซนติเมตร จะใช้เกณฑ์เดียวกับ PC01 (Good, Warning, Affects health, Danger, Hazardous) หากระดับ ≥ 20,000 จะถือว่าเป็น Hazardous",
            "การเผาไหม้จากยานพาหนะ โรงงานอุตสาหกรรม ควันจากไฟป่า และกิจกรรมที่ก่อให้เกิดฝุ่น",
            "ผลกระทบระยะสั้น: การระคายเคืองต่อระบบทางเดินหายใจ, อาการไอหรือหายใจลำบาก",
            "ผลกระทบระยะยาว: ความเสี่ยงต่อโรคระบบทางเดินหายใจ"
        ]
    },
    {
        title: "Daily Mean PC0.1 (ค่าเฉลี่ยรายวันของอนุภาคขนาดเล็ก)",
        description: [
            "ค่าเฉลี่ยรายวันของจำนวนอนุภาคขนาดเล็ก (PC0.1) วัดเป็นอนุภาคต่อลูกบาศก์เซนติเมตร (PNC) ระดับสูงอาจบ่งชี้ถึงมลพิษในอากาศที่ต่อเนื่องและส่งผลต่อสุขภาพในระยะยาว",
            "การเผาไหม้จากยานพาหนะ โรงงานอุตสาหกรรม ควันจากไฟป่า และกิจกรรมที่ก่อให้เกิดฝุ่น",
            "ผลกระทบระยะสั้น: การระคายเคืองต่อระบบทางเดินหายใจ",
            "ผลกระทบระยะยาว: ความเสี่ยงต่อโรคระบบทางเดินหายใจ, ผลกระทบต่อสุขภาพหัวใจและหลอดเลือด"
        ]
    }
];

const TriviaPopupContent = ({ onClose }) => {
    return (
        <div className="bg-white rounded-lg max-w-2xl min-w-[20rem] w-full mx-4 p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-black font-sarabun">เกร็ดความรู้</h3>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-3xl"
                >
                    ×
                </button>
            </div>
            <div className="space-y-6">
                {TRIVIA_DATA.map((trivia, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-lg">
                        <h4 className="text-xl font-semibold mb-3 text-black font-sarabun">{trivia.title}</h4>
                        <ul className="list-disc pl-6 text-lg text-gray-600 font-sarabun">
                            {trivia.description.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <button onClick={onClose} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg transition-colors text-xl font-medium font-sarabun">
                    ปิด
                </button>
            </div>
        </div>
    );
};

const PMDetailsPopupContent = ({ onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = TRIVIA_DATA.slice(3); // PM2.5, PM10, HourlyMeanPC0.1, DailyMeanPC0.1
    const trackRef = useRef(null);
    let autoPlayInterval = useRef(null);
    let progressInterval = useRef(null);

    const updateSlideClasses = () => {
        const slideElements = document.querySelectorAll('.popup-slide');
        const indicatorElements = document.querySelectorAll('.indicator');

        slideElements.forEach((slide, index) => {
            slide.className = 'popup-slide';
            if (index === currentSlide) {
                slide.classList.add('center');
            } else if (Math.abs(index - currentSlide) === 1) {
                slide.classList.add('side');
            } else {
                slide.classList.add('far');
            }
        });

        indicatorElements.forEach((indicator, index) => {
            indicator.className = 'indicator';
            if (index === currentSlide) {
                indicator.classList.add('active');
            }
        });

        if (trackRef.current) {
            const offset = (currentSlide * -330) + (slides.length * 165) - 165;
            trackRef.current.style.transform = `translateX(${offset}px)`;
        }
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        resetAutoPlay();
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        resetAutoPlay();
    };

    const startAutoPlay = () => {
        let progress = 0;
        const progressBar = document.getElementById('progressBar');

        autoPlayInterval.current = setInterval(() => {
            nextSlide();
        }, 5000);

        progressInterval.current = setInterval(() => {
            progress += 2;
            if (progressBar) progressBar.style.width = `${progress}%`;
            if (progress >= 100) progress = 0;
        }, 100);
    };

    const resetAutoPlay = () => {
        clearInterval(autoPlayInterval.current);
        clearInterval(progressInterval.current);
        const progressBar = document.getElementById('progressBar');
        if (progressBar) progressBar.style.width = '0%';
        startAutoPlay();
    };

    const setupTouchEvents = (container) => {
        let startX = 0;
        let isDragging = false;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        container.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            isDragging = false;
        });

        container.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        container.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            const diff = startX - e.clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            isDragging = false;
        });
    };

    useEffect(() => {
        updateSlideClasses();
        startAutoPlay();
        const container = document.querySelector('.popup-container');
        if (container) setupTouchEvents(container);

        return () => {
            clearInterval(autoPlayInterval.current);
            clearInterval(progressInterval.current);
        };
    }, [currentSlide]);

    return (
        <div className="bg-white rounded-lg max-w-3xl min-w-[20rem] w-full mx-4 p-8 max-h-[70vh] shadow-2xl" style={{ position: 'relative', zIndex: 1001 }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-black font-sarabun">รายละเอียดมลพิษทางอากาศ</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors p-1 rounded-md hover:bg-gray-100">
                    ×
                </button>
            </div>
            <div className="carousel-wrapper" style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div ref={trackRef} className="carousel-track" style={{ display: 'flex', transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', gap: '30px' }}>
                    {slides.map((trivia, index) => (
                        <div key={index} className="popup-slide" style={{ minWidth: '300px', height: '300px', background: 'linear-gradient(135deg, #ffffff, #f8f9fa)', borderRadius: '20px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <h4 className="slide-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: 'inherit' }}>{trivia.title}</h4>
                            <ul className="slide-content" style={{ fontSize: '1rem', lineHeight: '1.6', opacity: '0.9', listStyle: 'disc', paddingLeft: '20px', textAlign: 'left' }}>
                                {trivia.description.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <button className="carousel-controls prev-btn" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', zIndex: 20, left: '20px' }} onClick={prevSlide}>
                    ‹
                </button>
                <button className="carousel-controls next-btn" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', zIndex: 20, right: '20px' }} onClick={nextSlide}>
                    ›
                </button>
                <div className="carousel-indicators" style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 20 }}>
                    {slides.map((_, index) => (
                        <div key={index} className="indicator" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s ease' }} onClick={() => setCurrentSlide(index)} />
                    ))}
                </div>
                <div id="progressBar" className="progress-bar" style={{ position: 'absolute', bottom: '0', left: '0', height: '4px', background: 'linear-gradient(90deg, #ff6b6b, #ffa500)', transition: 'width 0.1s ease', borderRadius: '2px 2px 0 0', width: '0%' }} />
                <div className="swipe-hint" style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    ← เลื่อนซ้าย-ขวา หรือใช้ปุ่มควบคุม →
                </div>
            </div>
            <button className="close-btn" style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,77,87,0.9)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', transition: 'all 0.3s ease', zIndex: 30 }} onClick={onClose}>
                ×
            </button>
        </div>
    );
};

export { TRIVIA_DATA, TriviaPopupContent, PMDetailsPopupContent };