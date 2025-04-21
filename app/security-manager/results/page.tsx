"use client"

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import type { User } from "@prisma/client"; // Import User type if needed for userId fetching

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Define the expected structure of the fetched analytics data item
interface AnalyticsAssignment {
  id: string;
  complianceLevel: ComplianceLevel | null; // Can be null if not set
  control: {
    id: string;
    mainComponent: string;
    controlNumber: string;
  };
}

// Define the structure for processed data grouped by main component
interface ComponentAnalytics {
  total: number;
  levels: {
    [key in ComplianceLevel]: number;
  };
  percentages: {
    [key in ComplianceLevel]: number;
  };
}

interface ProcessedAnalyticsData {
  [mainComponent: string]: ComponentAnalytics;
}

// Define ComplianceLevel Enum based on Prisma schema
enum ComplianceLevel {
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  PARTIALLY_IMPLEMENTED = "PARTIALLY_IMPLEMENTED",
  IMPLEMENTED = "IMPLEMENTED",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

// Mapping for display names (Arabic)
const complianceLevelLabels: Record<ComplianceLevel, string> = {
  [ComplianceLevel.NOT_IMPLEMENTED]: "غير مطبق",
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: "مطبق جزئيًا",
  [ComplianceLevel.IMPLEMENTED]: "مطبق كليًا",
  [ComplianceLevel.NOT_APPLICABLE]: "لا ينطبق",
};

// Define colors for consistency (adjust as needed)
const complianceLevelColors: Record<ComplianceLevel, string> = {
  [ComplianceLevel.NOT_IMPLEMENTED]: '#EF4444', // Red-500
  [ComplianceLevel.PARTIALLY_IMPLEMENTED]: '#F59E0B', // Amber-500
  [ComplianceLevel.IMPLEMENTED]: '#10B981', // Emerald-500
  [ComplianceLevel.NOT_APPLICABLE]: '#6B7280', // Gray-500
};

// Order for displaying levels in charts/legends
const complianceLevelOrder: ComplianceLevel[] = [
  ComplianceLevel.IMPLEMENTED,
  ComplianceLevel.PARTIALLY_IMPLEMENTED,
  ComplianceLevel.NOT_IMPLEMENTED,
  ComplianceLevel.NOT_APPLICABLE,
];


export default function SecurityManagerResultsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ProcessedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Temporary User ID Fetch (same as dashboard) ---
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/users/security-managers');
        if (!response.ok) throw new Error('Failed to fetch security managers');
        const managers: User[] = await response.json();
        if (managers.length > 0) {
          setUserId(managers[0].id);
        } else {
          setError("No Security Manager user found.");
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching user ID:", err);
        setError(err.message || "Failed to get user ID");
        setIsLoading(false);
      }
    };
    fetchUserId();
  }, []);
  // --- End Temporary User ID Fetch ---

  // Fetch and process analytics data when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      setAnalyticsData(null); // Clear previous data

      try {
        const response = await fetch(`/api/control-assignments/analytics?securityManagerId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch analytics data: ${response.statusText}`);
        }
        const rawAssignments: AnalyticsAssignment[] = await response.json();

        // Process the data
        const processedData: ProcessedAnalyticsData = {};

        rawAssignments.forEach(assignment => {
          const component = assignment.control.mainComponent;
          const level = assignment.complianceLevel;

          if (!component) return; // Skip if mainComponent is missing

          // Initialize component data if it doesn't exist
          if (!processedData[component]) {
            processedData[component] = {
              total: 0,
              levels: {
                [ComplianceLevel.NOT_IMPLEMENTED]: 0,
                [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
                [ComplianceLevel.IMPLEMENTED]: 0,
                [ComplianceLevel.NOT_APPLICABLE]: 0,
              },
              percentages: { // Initialize percentages
                [ComplianceLevel.NOT_IMPLEMENTED]: 0,
                [ComplianceLevel.PARTIALLY_IMPLEMENTED]: 0,
                [ComplianceLevel.IMPLEMENTED]: 0,
                [ComplianceLevel.NOT_APPLICABLE]: 0,
              }
            };
          }

          // Increment total count for the component
          processedData[component].total++;

          // Increment count for the specific compliance level, if valid
          if (level && complianceLevelLabels[level]) {
            processedData[component].levels[level]++;
          }
          // Optionally handle null or unexpected levels if needed
        });

        // Calculate percentages for each component
        Object.keys(processedData).forEach(component => {
          const componentData = processedData[component];
          if (componentData.total > 0) {
            complianceLevelOrder.forEach(level => {
              componentData.percentages[level] = parseFloat(
                ((componentData.levels[level] / componentData.total) * 100).toFixed(1) // 1 decimal place
              );
            });
          }
        });


        setAnalyticsData(processedData);

      } catch (err: any) {
        console.error("Error fetching or processing analytics data:", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [userId]); // Re-run when userId changes

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)]" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-nca-teal" />
        <span className="ml-2">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-150px)] text-red-600" dir="rtl">
        <AlertCircle className="h-6 w-6" />
        <span className="ml-2">خطأ: {error}</span>
      </div>
    );
  }

  if (!analyticsData || Object.keys(analyticsData).length === 0) {
    return (
      <div className="text-center py-10 text-gray-600" dir="rtl">
        لا توجد بيانات نتائج لعرضها.
      </div>
    );
  }

  // Get sorted list of main components
  const mainComponents = Object.keys(analyticsData).sort();

  // Prepare data for the overall stacked bar chart
  const stackedBarSeries = complianceLevelOrder.map(level => ({
    name: complianceLevelLabels[level],
    data: mainComponents.map(component => analyticsData[component]?.percentages[level] || 0)
  }));

  const stackedBarOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      stackType: '100%', // Stack to 100%
      toolbar: { show: true },
      fontFamily: 'inherit', // Use website font
      // Removed invalid rtl: true property
    },
    plotOptions: {
      bar: {
        horizontal: false, // Vertical bars
      },
    },
    xaxis: {
      categories: mainComponents, // Main components on X-axis
      labels: {
         style: {
            fontFamily: 'inherit',
         }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val.toFixed(0)}%`, // Show percentage on Y-axis
         style: {
            fontFamily: 'inherit',
         }
      }
    },
    colors: complianceLevelOrder.map(level => complianceLevelColors[level]),
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontFamily: 'inherit',
      markers: {
        offsetX: 5 // Adjust marker position for RTL
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(1)}%` // Show percentage in tooltip
      },
      style: {
         fontFamily: 'inherit',
      }
    },
    dataLabels: {
      enabled: false, // Disable data labels on bars for cleaner look
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // Zebra striping
        opacity: 0.5
      },
    },
  };


  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">نتائج الامتثال</h1>

      {/* Overall Stacked Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">نظرة عامة على الامتثال حسب المكون الرئيسي</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={stackedBarOptions}
            series={stackedBarSeries}
            type="bar"
            height={350}
            width="100%"
          />
        </CardContent>
      </Card>

      {/* Individual Doughnut Charts per Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainComponents.map((component) => {
          const componentData = analyticsData[component];
          if (!componentData) return null;

          const doughnutSeries = complianceLevelOrder.map(level => componentData.levels[level]);
          const doughnutLabels = complianceLevelOrder.map(level => complianceLevelLabels[level]);
          const doughnutColors = complianceLevelOrder.map(level => complianceLevelColors[level]);

          const doughnutOptions: ApexCharts.ApexOptions = {
            chart: {
              type: 'donut',
              fontFamily: 'inherit',
            },
            labels: doughnutLabels,
            colors: doughnutColors,
            legend: {
              position: 'bottom',
              fontFamily: 'inherit',
            },
            tooltip: {
               y: {
                  formatter: (val) => `${val} (${((val / componentData.total) * 100).toFixed(1)}%)`
               },
               style: {
                  fontFamily: 'inherit',
               }
            },
            dataLabels: {
              enabled: true,
              formatter: function (val, opts) {
                // Show percentage on the slices
                return `${parseFloat(val as string).toFixed(1)}%`
              },
               style: {
                  fontFamily: 'inherit',
               }
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    total: {
                      show: true,
                      label: 'الإجمالي',
                      formatter: () => componentData.total.toString()
                    }
                  }
                }
              }
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: 'bottom'
                }
              }
            }]
          };

          return (
            <Card key={component}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold truncate" title={component}>
                  {component}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Chart
                  options={doughnutOptions}
                  series={doughnutSeries}
                  type="donut"
                  height={300}
                  width="100%"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
