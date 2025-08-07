"use client";

import "svg2pdf.js";
import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Transaction } from "@/models/Transaction";
import { formatCurrencyBRL } from "@/lib/formatCurrency";
import { toPng } from "html-to-image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import "svg2pdf.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faReceipt,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";

type ChartItem = {
  name: string;
  value: number;
  type: string;
};

export default function FinanceChart() {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [value, setValue] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { accounts } = useAuth();
  const [data, setData] = useState<ChartItem[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(
    {}
  );
  const chartRef = useRef<HTMLDivElement>(null);
  // const screenWidth = useWindowSize();
  //const isMobile = screenWidth < 640;
  const isMobile = useIsMobile();
  const outerRadius = isMobile ? 100 : 140;
  const innerRadius = isMobile ? 70 : 100;

  function formatEnumName(value: string): string {
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const generateColorByIndex = (index: number) => {
    const palette = [
      "#F1823D",
      "#8F3CFF",
      "#2567F9",
      "#FF3C82",
      "#F1A23D",
      "#A16CFF",
      "#3A73F9",
      "#FF6C82",
      "#F18290",
      "#6BBFFF",
      "#FFA73D",
      "#3CDF8F",
    ];
    return palette[index % palette.length];
  };

  const exportPDF = () => {
    const graficoElement = document.getElementById("grafico");

    if (!graficoElement) {
      alert("Gráfico não encontrado.");
      return;
    }

    toPng(graficoElement, {
      cacheBust: true,
      backgroundColor: "#ffffff", // evita fundo transparente
    })
      .then((dataUrl) => {
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: [img.width, img.height],
          });

          pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
          pdf.save("grafico.pdf");
        };
      })
      .catch((error) => {
        console.error("Erro ao gerar imagem:", error);
        alert("Erro ao exportar gráfico. Verifique o console.");
      });
  };

  const formatValue = (value: string) => {
    // Remove tudo que não for número
    const onlyNum = value.replace(/\D/g, ".");

    // Converte para float com duas casas decimais
    const number = (parseFloat(onlyNum) / 100).toFixed(2);
    return number.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // const getFinancialTip = (actualSpending: number, spendingGoal: number) => {
  //   if (
  //     !actualSpending ||
  //     !spendingGoal ||
  //     isNaN(actualSpending) ||
  //     isNaN(spendingGoal)
  //   ) {
  //     return "ℹ️ Para receber dicas personalizadas, preencha sua meta de gastos mensais.";
  //   }

  //   const percentage = (actualSpending / spendingGoal) * 100;

  //   if (percentage < 80)
  //     return "✅ Ótimo trabalho! Seus gastos estão bem controlados. \n💰Que tal investir a diferença ou reforçar sua reserva? 📈";
  //   if (percentage < 100)
  //     return "⚠️ Atenção! Você está se aproximando da meta. \n👀Reveja gastos com delivery, lazer ou compras. 📊";
  //   return "🚨 Alerta! Você ultrapassou a meta. \n⛔Tente evitar gastos não essenciais e reequilibrar o orçamento. 🧮";
  // };

  // const getStyleClass = (actualSpending: number, spendingGoal: number) => {
  //   if (
  //     !actualSpending ||
  //     !spendingGoal ||
  //     isNaN(actualSpending) ||
  //     isNaN(spendingGoal)
  //   ) {
  //     return {
  //       bg: "bg-blue-50",
  //       text: "text-blue-800",
  //       border: "border-blue-300",
  //     };
  //   }

  //   const percentage = (actualSpending / spendingGoal) * 100;

  //   const styles = [
  //     {
  //       min: 0,
  //       max: 50,
  //       bg: "bg-green-50",
  //       text: "text-green-800",
  //       border: "border-green-300",
  //     },
  //     {
  //       min: 50,
  //       max: 100,
  //       bg: "bg-yellow-50",
  //       text: "text-yellow-800",
  //       border: "border-yellow-300",
  //     },
  //     {
  //       min: 100,
  //       max: Infinity,
  //       bg: "bg-red-50",
  //       text: "text-red-800",
  //       border: "border-red-300",
  //     },
  //   ];

  //   return styles.find(
  //     ({ min, max }) => percentage >= min && percentage < max
  //   )!;
  // };
  
  function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      function handleResize() {
        setIsMobile(window.innerWidth < 640);
      }
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return isMobile;
  }

  useEffect(() => {
    async function fetchData() {
      if (!accounts || accounts.length === 0) return;

      const activeAccount = accounts[0]; // or another way to get the active account
      const categories: Transaction[] =
        await activeAccount.getExpensesByCategoryForMonth(month, year);

      const chartData = categories.map((transaction) => ({
        name: formatEnumName(transaction.description || "No description"),
        value: transaction.amount,
        type: transaction.type,
      }));

      setCategoryColors((prevColors) => {
        const updatedColors = { ...prevColors };
        chartData.forEach((item, index) => {
          if (!updatedColors[item.name]) {
            updatedColors[item.name] = generateColorByIndex(
              index
            );
          }
        });
        return updatedColors;
      });

      setData(chartData);

      const monthlyTotal = chartData.reduce((sum, item) => sum + item.value, 0);
      setMonthlyTotal(monthlyTotal);
    }

    fetchData();
  }, [accounts, month, year]);
  const totalAmount = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="w-full max-w-[100%] mx-auto flex flex-col justify-center">
      <div className="w-full max-w-[100%] flex flex-col justify-center">
        <h1
          className="w-full sm:text-2xl md:text-2xl lg:text-2xl font-extrabold tracking-tight px-4 py-6
          text-slate-800 from-blue-100 via-white to-blue-100 shadow-lg rounded-lg
          flex justify-center items-center text-center"
        >
          Painel Financeiro
        </h1>
        <div className="grid z-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          <div className="flex flex-col justify-between h-full bg-white border border-gray-200 p-4 rounded-xl shadow-md text-center transition duration-300 hover:scale-105 hover:shadow-lg">
            <label className="text-gray-500 text-2xl font-semibold whitespace-nowrap flex justify-center items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} />
              Mês e o ano
            </label>

            <div className="relative text-2xl sm:text-2xl">
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => {
                  if (!date) return;
                  setSelectedDate(date);
                  setMonth(date.getMonth() + 1);
                  setYear(date.getFullYear());
                }}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="border border-gray-300 text-2xl font-semibold rounded-lg px-4 py-2 w-full max-w-xs text-center focus:outline-none focus:ring-2 focus:ring-[#004D61]"
                placeholderText="MM/AAAA"
                aria-label="Selecionar mês e ano"
                popperPlacement="bottom-start"
                popperClassName="!z-[9999]"
                portalId="root-portal"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between h-full bg-white border border-gray-200 p-4 rounded-xl shadow-md text-center transition duration-300 hover:scale-105 hover:shadow-lg">
            <h2 className="text-gray-500 text-2xl font-semibold whitespace-nowrap flex justify-center items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} />
              Gastos do mês
            </h2>
            <p className="text-2xl font-bold text-red-500 w-full min-h-[48px] px-4">
              {monthlyTotal !== null
                ? formatCurrencyBRL(monthlyTotal)
                : "Carregando..."}
            </p>
          </div>

          <div className="flex flex-col justify-between h-full bg-white border border-gray-200 p-4 rounded-xl shadow-md text-center transition duration-300 hover:scale-105 hover:shadow-lg">
            <label
              htmlFor="value"
              className="text-gray-500 text-2xl font-semibold whitespace-nowrap flex justify-center items-center gap-2"
            >
              <FontAwesomeIcon icon={faRocket} />
              Meta mensal
            </label>
            <input
              type="text"
              id="value"
              name="value"
              required
              placeholder="Digite sua meta"
              className="w-full min-h-[48px] text-2xl bg-white text-[#444444] text-center rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#004D61] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={value ? `R$ ${formatValue(value)}` : ""}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, "");
                setValue(rawValue);
              }}
            />
          </div>
        </div>

        <div
          aria-label={`Gráfico de pizza mostrando a distribuição financeira de ${month}/${year}`}
          className="flex flex-col p-4 rounded-lg shadow-lg m-4 bg-[#004D61]"
        >
          <div id="grafico" ref={chartRef} className="bg-[#004D61]">
            <h2 className="text-3xl font-bold mb-2 text-center mt-5 text-white">
              Distribuição Financeira
            </h2>
            {/* Texto acessível para leitores de tela */}
            <p className="sr-only">
              Este gráfico mostra a distribuição de gastos do mês {month}/{year}
              .{" "}
              {data
                .map((d) => `${d.name} com R$ ${d.value.toFixed(2)}`)
                .join(", ")}
              . Total do mês: R$ {monthlyTotal.toFixed(2)}.
            </p>
            {/* <div
              className="mt-6 px-4 sm:px-6 py-5 rounded-2xl shadow-md border-l-4 border-blue-500 bg-blue-50
             max-w-full sm:max-w-2xl mx-auto break-words"
            >
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                💬 Dica do mês
              </h2>
              {!valor || isNaN(monthlyTotal) || isNaN(parseFloat(valor)) ? (
                <div
                  className="text-[1.375rem] px-4 py-4 rounded-xl font-medium border border-b-indigo-200
                 bg-yellow-50 text-yellow-800 flex items-center gap-2 shadow-sm break-words"
                  style={{ wordBreak: "break-word" }}
                >
                  ℹ️ Para receber dicas personalizadas, preencha sua meta de
                  gastos mensais.
                </div>
              ) : (
                (() => {
                  const Goal = parseFloat(valor) / 100;
                  const styles = getStyleClass(monthlyTotal, Goal) || {
                    bg: "bg-gray-100",
                    text: "text-gray-800",
                    border: "border-gray-200",
                  };
                  const { bg, text, border } = styles;
                  const dica =
                    getFinancialTip(monthlyTotal, Goal)?.toString() || "";
                  return (
                    <div
                      className={`px-4 py-4 text-[1.375rem] rounded-xl font-medium border shadow-sm ${bg} ${text} ${border} break-words`}
                      style={{
                        whiteSpace: "pre-line",
                        wordBreak: "break-word",
                      }}
                    >
                      {dica}
                    </div>
                  );
                })()
              )}
            </div> */}

            <div className="h-[70vh] flex items-center justify-center">
              {data.length === 0 ? ( // ⬅️ Adição
                <div className="text-center text-gray-500 text-xl italic">
                  📭 Nenhum gasto registrado neste mês.
                </div>
              ) : (
                // ⬅️ Adição
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={outerRadius}
                      innerRadius={innerRadius}
                      paddingAngle={4}
                      startAngle={360}
                      endAngle={0}
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-in-out"
                      className="text-[10px] text-white sm:text-[14px] font-semibold"
                      label={({ name, value }) =>
                        isMobile
                          ? `${(
                              ((value ?? totalAmount) / totalAmount) *
                              100
                            ).toFixed(0)}%`
                          : `${name}: ${(
                              ((value ?? totalAmount) / totalAmount) *
                              100
                            ).toFixed(0)}%`
                      }
                      labelLine={false}
                      color="#ffffff"
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={categoryColors[entry.name] ?? "#ccc"}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const { name, value } = payload[0];
                          return (
                            <div className="bg-white shadow px-4 py-2 rounded text-base border border-gray-200">
                              <strong className="text-[16px]">{name}</strong>:{" "}
                              <span className="text-[16px] text-gray-700">
                                R$ {value.toLocaleString("pt-BR")}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      content={({ payload }) => (
                        <div className="w-full px-4 mt-6">
                          <ul className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center items-center text-base md:text-lg font-medium border border-gray-200 shadow rounded-xl p-4">
                            {payload?.map((entry, index) => (
                              <li
                                key={`item-${index}`}
                                className="flex items-center gap-2"
                              >
                                <span
                                  className="inline-block w-4 h-4 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                ></span>
                                <span className="truncate text-white">
                                  {entry.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10 mb-6">
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 shadow-lg transition duration-300"
          >
            <ArrowDownTrayIcon className="w-6 h-6" />
            Baixar Gráfico em PDF
          </button>
        </div>
      </div>
    </div>
  );
}
