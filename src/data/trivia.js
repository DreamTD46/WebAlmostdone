import React from 'react';

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

export { TRIVIA_DATA, TriviaPopupContent };