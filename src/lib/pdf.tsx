import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CalendarDay } from "./schema";

const MONTH_NAMES = [
  "",
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const TYPE_COLORS: Record<string, string> = {
  Reels: "#7c3aed",
  Carrossel: "#0ea5e9",
  Story: "#f59e0b",
  Feed: "#10b981",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#7c3aed",
    borderBottomStyle: "solid",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 3,
  },
  badge: {
    fontSize: 8,
    color: "#7c3aed",
    fontFamily: "Helvetica-Bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  card: {
    width: "18.8%",
    borderRadius: 5,
    padding: 6,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 5,
    minHeight: 90,
  },
  dayNum: {
    fontSize: 7,
    color: "#9ca3af",
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  typeBadge: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    marginBottom: 4,
    color: "#ffffff",
    alignSelf: "flex-start",
  },
  theme: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a2e",
    marginBottom: 3,
    lineHeight: 1.3,
  },
  hook: {
    fontSize: 7,
    color: "#4b5563",
    fontStyle: "italic",
    lineHeight: 1.3,
  },
  footer: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 7,
    color: "#d1d5db",
  },
});

type Props = {
  businessName: string;
  niche: string;
  month: number;
  year: number;
  days: CalendarDay[];
  primaryColor?: string;
};

export function CalendarPdf({ businessName, niche, month, year, days, primaryColor = "#7c3aed" }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={[styles.header, { borderBottomColor: primaryColor }]}>
          <View>
            <Text style={styles.title}>
              Calendario de Conteudo — {MONTH_NAMES[month]}/{year}
            </Text>
            <Text style={styles.subtitle}>
              {businessName} · {niche}
            </Text>
          </View>
          <Text style={[styles.badge, { color: primaryColor }]}>PostaJa · postaja.com.br</Text>
        </View>

        <View style={styles.grid}>
          {days.map((day) => (
            <View key={day.day} style={styles.card}>
              <Text style={styles.dayNum}>Dia {day.day}</Text>
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      TYPE_COLORS[day.type] ?? "#6b7280",
                  },
                ]}
              >
                <Text>{day.type}</Text>
              </View>
              <Text style={styles.theme}>{day.theme}</Text>
              <Text style={styles.hook}>{day.hook}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Criado com PostaJa · postaja.com.br · Conteudo gerado por IA
        </Text>
      </Page>
    </Document>
  );
}
