document.addEventListener('DOMContentLoaded', () => {
    // Menü düğmesini oluştur
    const menuButton = document.createElement('button');
    menuButton.id = 'menu-toggle';
    menuButton.textContent = '☰';
    
    // Menü düğmesini header'a ekle
    const header = document.querySelector('.header');
    header.insertBefore(menuButton, header.firstChild);
    
    // Menü düğmesine tıklama olayını ekle
    menuButton.addEventListener('click', () => {
        const nav = document.querySelector('.nav');
        nav.classList.toggle('show');
    });

    // Dortmund için koordinatlar
    const latitude = 51.510183577644874;
    const longitude = 7.380454267494613;

    // Ezan vakitlerini al
    fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`)
        .then(response => response.json())
        .then(data => {
            const times = data.data.timings;

            // Zamanları formatla
            const getFormattedTime = (time) => {
                const [hours, minutes] = time.split(':');
                return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
            };

            // Ezan vakitlerini listele
            const timeList = [
                { label: 'Sabah', time: times.Fajr },
                { label: 'Gün doğumu', time: times.Sunrise },
                { label: 'Öğle', time: times.Dhuhr },
                { label: 'İkindi', time: times.Asr },
                { label: 'Akşam', time: times.Maghrib },
                { label: 'Yatsı', time: times.Isha }
            ];

            const currentTime = new Date();
            const currentTimeString = getFormattedTime(`${currentTime.getHours()}:${currentTime.getMinutes()}`);

            let htmlContent = '';
            let currentPrayer = '';
            let nextPrayer = null;

            // Mevcut ezan vaktini bul
            timeList.forEach((item, index) => {
                const prayerTimeString = getFormattedTime(item.time);
                const nextPrayerTimeString = index < timeList.length - 1 ? getFormattedTime(timeList[index + 1].time) : '23:59';

                const prayerStartDate = new Date();
                const [prayerHours, prayerMinutes] = prayerTimeString.split(':').map(Number);
                prayerStartDate.setHours(prayerHours, prayerMinutes, 0);

                const prayerEndDate = new Date();
                const [nextPrayerHours, nextPrayerMinutes] = nextPrayerTimeString.split(':').map(Number);
                prayerEndDate.setHours(nextPrayerHours, nextPrayerMinutes, 0);

                if (currentTime >= prayerStartDate && currentTime < prayerEndDate) {
                    currentPrayer = item.label;
                }

                htmlContent += `
                    <div class="time ${currentPrayer === item.label ? 'current-time' : ''}">
                        ${item.label}: ${item.time}
                    </div>
                `;
            });

            document.getElementById('prayer-times').innerHTML = htmlContent;

            // Geri sayımı hesapla
            const countdownElement = document.getElementById('countdown');
            const titleElement = document.querySelector('.countdown h2');

            const updateCountdown = () => {
                // Sonraki namaz vaktini bul
                const nextPrayerItem = timeList.find(item => {
                    const [hours, minutes] = item.time.split(':').map(Number);
                    const prayerDate = new Date();
                    prayerDate.setHours(hours, minutes, 0);
                    return prayerDate > currentTime;
                });

                if (nextPrayerItem) {
                    const nextPrayerDate = new Date();
                    const [hours, minutes] = nextPrayerItem.time.split(':').map(Number);
                    nextPrayerDate.setHours(hours, minutes, 0);

                    const diff = nextPrayerDate - currentTime;

                    if (diff <= 0) {
                        countdownElement.innerHTML = 'Namaz vakti geldi!';
                    } else {
                        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

                        countdownElement.innerHTML = `
                            <div class="countdown-time">
                                ${hoursLeft.toString().padStart(2, '0')} :
                                ${minutesLeft.toString().padStart(2, '0')} :
                                ${secondsLeft.toString().padStart(2, '0')}
                            </div>
                            <div class="countdown-labels">
                                <span>Saat</span> :
                                <span>Dakika</span> :
                                <span>Saniye</span>
                            </div>
                        `;
                    }

                    // "Bir sonraki vakit" metnini güncelle
                    titleElement.innerHTML = `<span class="highlight">${nextPrayerItem.label}</span> vaktine`;
                } else {
                    countdownElement.innerHTML = 'Sonraki namaz vakti bulunamadı.';
                    titleElement.innerHTML = '';
                }
            };

            // Geri sayımı güncelle
            setInterval(() => {
                // Güncel zamanı yenile
                currentTime.setSeconds(currentTime.getSeconds() + 1);
                updateCountdown();
            }, 1000);

            updateCountdown();
        })
        .catch(error => {
            document.getElementById('prayer-times').innerHTML = '<p>Veriler alınırken bir hata oluştu.</p>';
            console.error('Error:', error);
        });
});
