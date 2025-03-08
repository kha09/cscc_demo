import { BarChart3, Truck, Monitor, RefreshCw, User, FileText, Search } from "lucide-react"

export default function ProcessTimeline() {
  const timelineItems = [
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "التقييم الذاتي",
      description: "تقوم الجهة بالرفع في إجراءات التقييم الذاتي وذلك من خلال العمل على أداء التقييم وقياس الإلتزام",
      color: "bg-blue-900",
      position: "right",
    },
    {
      icon: <Truck className="h-6 w-6 text-white" />,
      title: "تجهيز الأدلة",
      description:
        "تقوم الجهة بتجهيز الأدلة وذلك لأعمال التدقيق من قبل الهيئة بحيث تكون معلومات الدليل واضحة، ومكتملة، ومترابطة، ومنظمة، وتتعلق بالسنة والنظام ومن الناحية الأساسي والفرعي",
      color: "bg-blue-900",
      position: "right",
    },
    {
      icon: <Monitor className="h-6 w-6 text-white" />,
      title: "الإرسال للهيئة الوطنية للأمن السيبراني",
      description: "تقوم الجهة بعد الانتهاء من التقييم الذاتي بإرسال نسخة من ملف الأداء إلى الهيئة",
      color: "bg-blue-900",
      position: "right",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-white" />,
      title: "تحسين مستمر",
      description: "تقوم الجهة بعمل الإجراءات اللازمة لضمان أن ضوابطها محققة بشكل فعال و مستمر",
      color: "bg-blue-900",
      position: "right",
    },
    {
      icon: <User className="h-6 w-6 text-white" />,
      title: "المراجعة من قبل الهيئة",
      description: "تقوم الهيئة بمراجعة ملف التقييم وقياس مدى التزام الجهات / الأنظمة بما ورد في الضوابط",
      color: "bg-teal-500",
      position: "left",
    },
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: "إرسال الملاحظات للجهة (إن وجدت)",
      description: "تقوم الهيئة بتزويد الجهة بالملاحظات",
      color: "bg-teal-500",
      position: "left",
    },
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: "متابعة مستمرة",
      description: "تقوم الهيئة بمتابعة التزام الجهات / الأنظمة بتطبيق الضوابط بشكل مستمر وفعال",
      color: "bg-teal-500",
      position: "left",
    },
  ]

  return (
    <section className="py-16 bg-white" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>

            {/* Timeline items */}
            <div className="space-y-20">
              {/* Legend */}
              <div className="relative z-10 flex justify-end mb-12">
                <div className="border border-gray-200 p-4 rounded-md flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-900"></div>
                    <span className="text-blue-900 font-semibold">الجهة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                    <span className="text-teal-500 font-semibold">الهيئة</span>
                  </div>
                </div>
              </div>

              {timelineItems.map((item, index) => (
                <div key={index} className="relative z-10">
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${item.color}`}>
                      {item.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`flex ${item.position === "right" ? "justify-start" : "justify-end"}`}>
                    <div className={`w-5/12 ${item.position === "right" ? "pr-8" : "pl-8"}`}>
                      <h3
                        className={`text-xl font-bold mb-2 text-center ${item.position === "right" ? "text-blue-900" : "text-teal-500"}`}
                      >
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed text-center">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

