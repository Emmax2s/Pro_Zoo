import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Ticket, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../contexts/SiteContext';
import { useLanguage } from '../contexts/LanguageContext';

type ScheduleKey = 'weekday' | 'weekend' | 'holiday';

const parseTimeToMinutes = (value: string) => {
  const match = value.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'AM') {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  return hours * 60 + minutes;
};

const minutesToClock = (minutes: number, language: 'es' | 'en') => {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatDuration = (minutes: number, language: 'es' | 'en') => {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(language === 'en' ? `${hours} hr${hours === 1 ? '' : 's'}` : `${hours} h`);
  }

  if (remainingMinutes > 0 || parts.length === 0) {
    parts.push(language === 'en' ? `${remainingMinutes} min` : `${remainingMinutes} min`);
  }

  return parts.join(' ');
};

const getScheduleKeyForDate = (date: Date): ScheduleKey => {
  const day = date.getDay();
  if (day === 0) {
    return 'holiday';
  }

  if (day === 6) {
    return 'weekend';
  }

  return 'weekday';
};

const getNextOpening = (
  now: Date,
  scheduleByKey: Record<ScheduleKey, { open: number; close: number }>
) => {
  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    const key = getScheduleKeyForDate(candidate);
    const schedule = scheduleByKey[key];
    if (!schedule) {
      continue;
    }

    const openingDate = new Date(candidate);
    openingDate.setHours(Math.floor(schedule.open / 60), schedule.open % 60, 0, 0);

    if (offset > 0 || openingDate.getTime() >= now.getTime()) {
      return openingDate;
    }
  }

  return null;
};

export function InfoSection() {
  const { siteData } = useSite();
  const { language, t, translateContent } = useLanguage();
  const { info } = siteData;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const scheduleStatus = useMemo(() => {
    const todayKey = getScheduleKeyForDate(now);
    const scheduleByKey = {
      weekday: {
        open: parseTimeToMinutes(info.weekdayHours.split(' - ')[0]) ?? 0,
        close: parseTimeToMinutes(info.weekdayHours.split(' - ')[1]) ?? 0,
      },
      weekend: {
        open: parseTimeToMinutes(info.weekendHours.split(' - ')[0]) ?? 0,
        close: parseTimeToMinutes(info.weekendHours.split(' - ')[1]) ?? 0,
      },
      holiday: {
        open: parseTimeToMinutes(info.holidayHours.split(' - ')[0]) ?? 0,
        close: parseTimeToMinutes(info.holidayHours.split(' - ')[1]) ?? 0,
      },
    } satisfies Record<ScheduleKey, { open: number; close: number }>;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const schedule = scheduleByKey[todayKey];
    const lastEntryMinutes = schedule.close - 60;
    const nextOpening = getNextOpening(now, scheduleByKey);

    if (currentMinutes < schedule.open || currentMinutes >= schedule.close) {
      return {
        state: 'closed' as const,
        label: t.infoSection.closedNow,
        detail: nextOpening ? t.infoSection.reopensAt.replace('{time}', minutesToClock(nextOpening.getHours() * 60 + nextOpening.getMinutes(), language)) : '',
        tone: 'bg-red-50 text-red-800' as const,
      };
    }

    if (currentMinutes >= lastEntryMinutes) {
      return {
        state: 'lastEntryClosed' as const,
        label: t.infoSection.openNow,
        detail: `${t.infoSection.lastEntryClosed} · ${t.infoSection.closesIn.replace('{time}', formatDuration(schedule.close - currentMinutes, language))}`,
        tone: 'bg-yellow-50 text-yellow-800' as const,
      };
    }

    return {
      state: 'open' as const,
      label: t.infoSection.openNow,
      detail: `${t.infoSection.lastEntryIn.replace('{time}', formatDuration(lastEntryMinutes - currentMinutes, language))} · ${t.infoSection.closesIn.replace('{time}', formatDuration(schedule.close - currentMinutes, language))}`,
      tone: 'bg-green-50 text-green-800' as const,
    };
  }, [info.holidayHours, info.weekdayHours, info.weekendHours, language, now, t.infoSection]);
  const mapQuery = info.address.trim();
  const mapEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : '';
  const mapLinkUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : '';

  return (
    <section id="info" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-green-800 mb-4">{translateContent(info.title)}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {translateContent(info.description)}
          </p>
        </div>

        <Tabs defaultValue="horarios" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="horarios">{translateContent(info.tabHoursLabel)}</TabsTrigger>
            <TabsTrigger value="precios">{translateContent(info.tabPricesLabel)}</TabsTrigger>
            <TabsTrigger value="ubicacion">{translateContent(info.tabLocationLabel)}</TabsTrigger>
          </TabsList>

          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  {translateContent(info.hoursCardTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">{translateContent(info.weekdayLabel)}</span>
                  <span className="text-green-700">{translateContent(info.weekdayHours)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">{translateContent(info.weekendLabel)}</span>
                  <span className="text-green-700">{translateContent(info.weekendHours)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">{translateContent(info.holidayLabel)}</span>
                  <span className="text-green-700">{translateContent(info.holidayHours)}</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className={`text-sm ${scheduleStatus.tone} rounded-md px-3 py-2`}>
                    <Calendar className="inline h-4 w-4 mr-2" />
                    <span className="font-semibold">{scheduleStatus.label}:</span> {scheduleStatus.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-green-600" />
                  {translateContent(info.pricesCardTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{translateContent(info.adultLabel)}</p>
                    <p className="text-sm text-gray-500">{translateContent(info.adultDetail)}</p>
                  </div>
                  <span className="text-green-700">{info.adultPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{translateContent(info.childLabel)}</p>
                    <p className="text-sm text-gray-500">{translateContent(info.childDetail)}</p>
                  </div>
                  <span className="text-green-700">{info.childPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{translateContent(info.seniorLabel)}</p>
                    <p className="text-sm text-gray-500">{translateContent(info.seniorDetail)}</p>
                  </div>
                  <span className="text-green-700">{info.seniorPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{translateContent(info.toddlerLabel)}</p>
                  </div>
                  <span className="text-green-700">{info.toddlerPrice}</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800">
                    💡 {translateContent(info.groupDiscountNote)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ubicacion">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  {translateContent(info.locationCardTitle)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-700 mb-2">{translateContent(info.addressLabel)}</p>
                  <p className="text-gray-600">{info.address}</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2">{translateContent(info.contactLabel)}</p>
                  <div className="space-y-2 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      {info.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      {info.email}
                    </p>
                  </div>
                </div>
                {mapEmbedUrl ? (
                  <div className="space-y-2">
                    <iframe
                      title={t.infoSection.mapTitle}
                      src={mapEmbedUrl}
                      className="h-64 w-full rounded-lg border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a
                      href={mapLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm text-green-700 hover:text-green-800 hover:underline"
                    >
                      {t.infoSection.openInMaps}
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">{translateContent(info.mapPlaceholderText)}</p>
                  </div>
                )}
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    🚗 {translateContent(info.parkingNote)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
