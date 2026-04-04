import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Ticket, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';

export function InfoSection() {
  const { siteData } = useSite();
  const { info } = siteData;
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
          <h2 className="text-green-800 mb-4">{info.title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {info.description}
          </p>
        </div>

        <Tabs defaultValue="horarios" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="horarios">{info.tabHoursLabel}</TabsTrigger>
            <TabsTrigger value="precios">{info.tabPricesLabel}</TabsTrigger>
            <TabsTrigger value="ubicacion">{info.tabLocationLabel}</TabsTrigger>
          </TabsList>

          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  {info.hoursCardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">{info.weekdayLabel}</span>
                  <span className="text-green-700">{info.weekdayHours}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">{info.weekendLabel}</span>
                  <span className="text-green-700">{info.weekendHours}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">{info.holidayLabel}</span>
                  <span className="text-green-700">{info.holidayHours}</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    {info.lastEntryNote}
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
                  {info.pricesCardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{info.adultLabel}</p>
                    <p className="text-sm text-gray-500">{info.adultDetail}</p>
                  </div>
                  <span className="text-green-700">{info.adultPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{info.childLabel}</p>
                    <p className="text-sm text-gray-500">{info.childDetail}</p>
                  </div>
                  <span className="text-green-700">{info.childPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{info.seniorLabel}</p>
                    <p className="text-sm text-gray-500">{info.seniorDetail}</p>
                  </div>
                  <span className="text-green-700">{info.seniorPrice}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">{info.toddlerLabel}</p>
                  </div>
                  <span className="text-green-700">{info.toddlerPrice}</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800">
                    💡 {info.groupDiscountNote}
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
                  {info.locationCardTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-700 mb-2">{info.addressLabel}</p>
                  <p className="text-gray-600">{info.address}</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2">{info.contactLabel}</p>
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
                      title="Mapa de ubicación"
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
                      Abrir en Google Maps
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">{info.mapPlaceholderText}</p>
                  </div>
                )}
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    🚗 {info.parkingNote}
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
