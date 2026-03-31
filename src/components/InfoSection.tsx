import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Ticket, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';

export function InfoSection() {
  const { siteData } = useSite();
  const { info } = siteData;

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
            <TabsTrigger value="horarios">Horarios</TabsTrigger>
            <TabsTrigger value="precios">Precios</TabsTrigger>
            <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
          </TabsList>

          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Horarios de Apertura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Lunes - Viernes</span>
                  <span className="text-green-700">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Sábados y Domingos</span>
                  <span className="text-green-700">8:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Días Festivos</span>
                  <span className="text-green-700">8:00 AM - 8:00 PM</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Última entrada: 1 hora antes del cierre
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
                  Precios de Entrada
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">Adultos</p>
                    <p className="text-sm text-gray-500">13 años y más</p>
                  </div>
                  <span className="text-green-700">$25.00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">Niños</p>
                    <p className="text-sm text-gray-500">3-12 años</p>
                  </div>
                  <span className="text-green-700">$15.00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">Adultos Mayores</p>
                    <p className="text-sm text-gray-500">65 años y más</p>
                  </div>
                  <span className="text-green-700">$18.00</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <p className="text-gray-700">Menores de 3 años</p>
                  </div>
                  <span className="text-green-700">Gratis</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800">
                    💡 Descuentos especiales para grupos de más de 10 personas
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
                  Cómo Llegar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-700 mb-2">Dirección:</p>
                  <p className="text-gray-600">Avenida Zoomat 1234, Ciudad, País</p>
                </div>
                <div>
                  <p className="text-gray-700 mb-2">Contacto:</p>
                  <div className="space-y-2 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600" />
                      +1 (555) 123-4567
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      info@zoomat.com
                    </p>
                  </div>
                </div>
                <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Mapa interactivo</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    🚗 Estacionamiento gratuito disponible
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
