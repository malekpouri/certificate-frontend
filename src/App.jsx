import React from 'react';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>سیستم مدیریت گواهی‌نامه</h1>
                <p>سیستم صدور و تأیید گواهی‌نامه‌های دیجیتال</p>
            </header>

            <main className="App-main">
                <div className="welcome-section">
                    <h2>خوش آمدید</h2>
                    <p>این سیستم امکان صدور، مدیریت و تأیید گواهی‌نامه‌های دیجیتال را فراهم می‌کند.</p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>🎓 مدیریت گواهی‌نامه</h3>
                            <p>صدور و مدیریت گواهی‌نامه‌های دیجیتال</p>
                        </div>

                        <div className="feature-card">
                            <h3>📱 کد QR</h3>
                            <p>تولید کد QR برای تأیید سریع گواهی‌نامه</p>
                        </div>

                        <div className="feature-card">
                            <h3>👥 مدیریت دانشجویان</h3>
                            <p>ثبت و مدیریت اطلاعات دانشجویان</p>
                        </div>

                        <div className="feature-card">
                            <h3>📚 مدیریت دوره‌ها</h3>
                            <p>ایجاد و مدیریت دوره‌های آموزشی</p>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn-primary">ورود به سیستم</button>
                        <button className="btn-secondary">مشاهده دمو</button>
                    </div>
                </div>
            </main>

            <footer className="App-footer">
                <p>&copy; 2025 سیستم مدیریت گواهی‌نامه. تمامی حقوق محفوظ است.</p>
            </footer>
        </div>
    );
}

export default App;