"use client";
import { useState } from "react";
import Image from "next/image";
import { CheckCircle, BarChart3, FileText, ArrowRight, Users, Activity, ClipboardList, AlertTriangle, Upload, MessageSquare } from "lucide-react";
import ProcessTimeline from "@/components/process-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
export default function LandingPage() {
    var _a = useState(""), email = _a[0], setEmail = _a[1];
    return (<div className="flex min-h-screen flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-nca-dark-blue text-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base lg:text-lg">
            <div className="relative h-16 w-16">
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain"/>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-nca-teal">
              المميزات
            </a>
            <a href="#process" className="text-sm font-medium hover:text-nca-teal">
              إجراءات التقييم
            </a>
            <a href="#benefits" className="text-sm font-medium hover:text-nca-teal">
              الفوائد
            </a>
            <a href="#about" className="text-sm font-medium hover:text-nca-teal">
              عن المنصة
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-white text-nca-dark-blue hover:bg-white hover:text-nca-dark-blue">
              <Link href="/signin">تسجيل الدخول</Link>
            </Button>
            <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark">
              <Link href="/signup">ابدأ الآن</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-nca-dark-blue to-nca-dark-blue-light py-20 md:py-32 text-white">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            تقييم الامتثال لضوابط الأمن السيبراني للأنظمة الحساسة
          </h1>
          <p className="text-xl text-nca-light-blue max-w-3xl mb-10">
            منصة ذاتية الخدمة تمكن المؤسسات من تقييم امتثالها لضوابط الأمن السيبراني للأنظمة الحساسة بشكل مستقل، مما
            يقلل الاعتماد على الطرق اليدوية والاستشاريين الخارجيين.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link href="/signup" className="w-full">
              <Button size="lg" className="w-full bg-nca-teal text-white hover:bg-nca-teal-dark">
                ابدأ التقييم مجاناً
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full border-white text-nca-dark-blue hover:bg-white hover:text-nca-dark-blue">
              تعرف على المزيد
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white mb-12">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-nca-dark-blue">مميزات المنصة</h2>
            <p className="text-xl text-nca-dark-blue-light max-w-2xl mx-auto">
              تقدم منصتنا مجموعة من المميزات المتقدمة لتسهيل عملية تقييم الامتثال للضوابط الأمنية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-nca-teal">
              <CardContent className="pt-6">
                <div className="mb-4 text-nca-teal">
                  <CheckCircle className="h-10 w-10"/>
                </div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">تقييم ذاتي</h3>
                <p className="text-nca-dark-blue-light">
                  تمكين المؤسسات من تقييم امتثالها بشكل مستقل دون الحاجة إلى استشاريين خارجيين
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-nca-teal">
              <CardContent className="pt-6">
                <div className="mb-4 text-nca-teal">
                  <BarChart3 className="h-10 w-10"/>
                </div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">تقييم آلي</h3>
                <p className="text-nca-dark-blue-light">
                  تقليل الأخطاء البشرية من خلال أتمتة تقييمات الامتثال، مما يضمن نتائج تقييم موثوقة وموحدة
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-nca-teal">
              <CardContent className="pt-6">
                <div className="mb-4 text-nca-teal">
                  <FileText className="h-10 w-10"/>
                </div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">تقارير شاملة</h3>
                <p className="text-nca-dark-blue-light">
                  توفير تقارير مفصلة ومنظمة توضح حالة الامتثال والمخاطر الأمنية وتوصيات للتحسين
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-nca-teal">
              <CardContent className="pt-6">
                <div className="mb-4 text-nca-teal">
                  <CheckCircle className="h-10 w-10"/>
                </div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">واجهة سهلة الاستخدام</h3>
                <p className="text-nca-dark-blue-light">
                  تصميم منصة تفاعلية مبسطة تسهل تقييم الامتثال وتعزز قابلية الاستخدام وتحسن تجربة المستخدم
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Timeline Section */}
      <section id="process" className="bg-white mb-12">
        <div className="container">
          <div className="text-center bg-white py-8">
            <h2 className="text-3xl font-bold" style={{ color: '#1a2e3c' }}>إجراءات التقييم وقياس الالتزام بضوابط الأمن السيبراني للأنظمة الحساسة</h2>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-nca-dark-blue">لوحات تحكم متخصصة لكل دور</h2>
            <p className="text-xl text-nca-dark-blue-light max-w-2xl mx-auto">
              توفر المنصة لوحات تحكم مخصصة لكل دور، مما يضمن حصول كل مستخدم على الأدوات والمعلومات المناسبة لمسؤولياته
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="overflow-hidden border-nca-teal">
              <div className="bg-nca-dark-blue text-white p-4">
                <h3 className="text-xl font-bold">لوحة تحكم المشرف</h3>
                <p className="text-sm text-nca-light-blue">إدارة المستخدمين والتقييمات ومراقبة النظام</p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <Users className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">إدارة المستخدمين</h4>
                      <p className="text-sm text-nca-dark-blue-light">إضافة وتعديل وإدارة حسابات المستخدمين والأدوار</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <BarChart3 className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">مؤشرات الامتثال العامة</h4>
                      <p className="text-sm text-nca-dark-blue-light">عرض ومراقبة مؤشرات الامتثال على مستوى المؤسسة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <Activity className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">سجلات النظام</h4>
                      <p className="text-sm text-nca-dark-blue-light">مراقبة نشاطات المستخدمين وأداء النظام</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-nca-teal">
              <div className="bg-nca-dark-blue text-white p-4">
                <h3 className="text-xl font-bold">لوحة تحكم مدير الأمن</h3>
                <p className="text-sm text-nca-light-blue">إدارة التقييمات وتحليل المخاطر وإنشاء التقارير</p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <ClipboardList className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">بدء التقييمات</h4>
                      <p className="text-sm text-nca-dark-blue-light">إنشاء وإدارة تقييمات الامتثال المختلفة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">تقييم المخاطر</h4>
                      <p className="text-sm text-nca-dark-blue-light">تحليل وتقييم المخاطر الأمنية وتحديد الأولويات</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">إنشاء التقارير</h4>
                      <p className="text-sm text-nca-dark-blue-light">إنشاء تقارير مفصلة عن حالة الامتثال والمخاطر</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden border-nca-teal">
              <div className="bg-nca-dark-blue text-white p-4">
                <h3 className="text-xl font-bold">لوحة تحكم مدير القسم</h3>
                <p className="text-sm text-nca-light-blue">إدارة فريق العمل ومراقبة امتثال القسم</p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <Users className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">إدارة الفريق</h4>
                      <p className="text-sm text-nca-dark-blue-light">إدارة أعضاء الفريق وتوزيع المهام</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <BarChart3 className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">حالة امتثال القسم</h4>
                      <p className="text-sm text-nca-dark-blue-light">مراقبة مستوى امتثال القسم للضوابط الأمنية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">مراجعة الأدلة</h4>
                      <p className="text-sm text-nca-dark-blue-light">مراجعة واعتماد أدلة الامتثال المقدمة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-nca-teal">
              <div className="bg-nca-dark-blue text-white p-4">
                <h3 className="text-xl font-bold">لوحة تحكم المستخدم</h3>
                <p className="text-sm text-nca-light-blue">إدارة المهام وتقديم أدلة الامتثال</p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <ClipboardList className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">إدارة المهام</h4>
                      <p className="text-sm text-nca-dark-blue-light">عرض وإدارة المهام المسندة والمواعيد النهائية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <Upload className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">تقديم الأدلة</h4>
                      <p className="text-sm text-nca-dark-blue-light">رفع وتقديم أدلة الامتثال للضوابط الأمنية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-nca-teal bg-opacity-10 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-nca-teal"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-nca-dark-blue">مساعد الامتثال</h4>
                      <p className="text-sm text-nca-dark-blue-light">الحصول على المساعدة والإرشادات حول متطلبات الامتثال</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark">
              <Link href="/signup">ابدأ استخدام لوحات التحكم</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-nca-light-blue">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-nca-dark-blue">فوائد استخدام المنصة</h2>
            <p className="text-xl text-nca-dark-blue-light max-w-2xl mx-auto">
              تساهم منصتنا في تحسين أداء إدارة الامتثال وفهم أفضل للمتطلبات التنظيمية وحماية أقوى للأنظمة الحساسة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="mt-1 text-nca-teal">
                <CheckCircle className="h-6 w-6"/>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">تحسين إدارة الامتثال</h3>
                <p className="text-nca-dark-blue-light">
                  تبسيط عمليات تقييم الامتثال وتوفير الوقت والموارد من خلال الأتمتة والتقارير المنظمة
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 text-nca-teal">
                <CheckCircle className="h-6 w-6"/>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">فهم أفضل للمتطلبات</h3>
                <p className="text-nca-dark-blue-light">
                  توفير رؤية واضحة للمتطلبات التنظيمية وكيفية تطبيقها في سياق المؤسسة
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 text-nca-teal">
                <CheckCircle className="h-6 w-6"/>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">تقليل المخاطر</h3>
                <p className="text-nca-dark-blue-light">
                  تحديد نقاط الضعف والثغرات الأمنية بشكل استباقي، مما يساعد على تقليل المخاطر السيبرانية
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 text-nca-teal">
                <CheckCircle className="h-6 w-6"/>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-nca-dark-blue">تعزيز الأمن السيبراني</h3>
                <p className="text-nca-dark-blue-light">
                  تحسين الوضع الأمني الشامل للمؤسسة من خلال الالتزام بأفضل الممارسات وضوابط الأمن السيبراني
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-nca-dark-blue">عن منصة تقييم الامتثال</h2>
              <p className="text-lg text-nca-dark-blue-light mb-6">
                تم تطوير هذه المنصة لمساعدة المؤسسات على تقييم امتثالها لضوابط الأمن السيبراني للأنظمة الحساسة الصادرة
                عن الهيئة الوطنية للأمن السيبراني.
              </p>
              <p className="text-lg text-nca-dark-blue-light mb-6">
                تهدف المنصة إلى معالجة التحديات الحالية في تقييم الامتثال وتقديم حل شامل يمكن المؤسسات من إدارة امتثالها
                بكفاءة وفعالية.
              </p>
              <Button className="bg-nca-teal text-white hover:bg-nca-teal-dark gap-2">
                تعرف على المزيد
                <ArrowRight className="h-4 w-4"/>
              </Button>
            </div>
            <div className="bg-nca-light-blue rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4 text-nca-dark-blue">أهداف المشروع</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-nca-teal shrink-0 mt-0.5"/>
                  <span className="text-nca-dark-blue-light">
                    تطوير منصة تقييم امتثال ذاتية الخدمة تمكن المؤسسات من تقييم امتثالها بشكل مستقل
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-nca-teal shrink-0 mt-0.5"/>
                  <span className="text-nca-dark-blue-light">
                    تصميم واجهة سهلة الاستخدام ومركزة على المستخدم لتبسيط عملية تقييم الامتثال
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-nca-teal shrink-0 mt-0.5"/>
                  <span className="text-nca-dark-blue-light">
                    ضمان الدقة والاتساق من خلال أتمتة عمليات التقييم وتقليل الأخطاء البشرية
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-nca-teal shrink-0 mt-0.5"/>
                  <span className="text-nca-dark-blue-light">
                    إنشاء تقارير امتثال شاملة توضح حالة الامتثال والمخاطر والتوصيات
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-nca-dark-blue text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">ابدأ تقييم الامتثال اليوم</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-nca-light-blue">
            سجل الآن للحصول على تجربة مجانية واكتشف كيف يمكن لمنصتنا مساعدة مؤسستك على تحسين امتثالها لضوابط الأمن
            السيبراني
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input type="email" placeholder="البريد الإلكتروني" className="px-4 py-3 rounded-md border bg-white text-nca-dark-blue w-full" value={email} onChange={function (e) { return setEmail(e.target.value); }}/>
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="whitespace-nowrap bg-nca-teal text-white hover:bg-nca-teal-dark">
                ابدأ الآن
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-nca-dark-blue-light text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-sm md:text-base">
            <div className="relative h-22 w-22">
              <Image src="/static/image/logo.png" width={160} height={160} alt="Logo" className="object-contain"/>
              </div>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-nca-light-blue hover:text-white">
                الشروط والأحكام
              </a>
              <a href="#" className="text-sm text-nca-light-blue hover:text-white">
                سياسة الخصوصية
              </a>
              <a href="#" className="text-sm text-nca-light-blue hover:text-white">
                اتصل بنا
              </a>
            </div>
            <div className="text-sm text-nca-light-blue">© {new Date().getFullYear()} جميع الحقوق محفوظة</div>
          </div>
        </div>
      </footer>
    </div>);
}
