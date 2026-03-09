import { StyleSheet, Text, View } from "@react-pdf/renderer";

// --------------------
// TIPOS
// --------------------
interface SectionTitleProps {
  number: number | string;
  title: string;
}

interface DetailItemProps {
  label: string;
  value: string | number | boolean | null | undefined;
}

interface CheckboxOptionsProps {
  question: string;
  value: string | boolean | null | undefined;
  obs?: string | null;
  options: string[];
}

// --------------------
// STYLES
// --------------------
export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  header: {
    position: "absolute",
    top: 25,
    left: 40,
    right: 40,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  brasao: {
    width: 40,
    height: 40,
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#333333",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#666666",
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
    padding: 6,
    borderRadius: 3,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 4,
    alignItems: "center",
  },
  detailKey: {
    width: "40%",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#4B5563",
  },
  detailValue: {
    width: "55%",
    fontSize: 9,
    color: "#1F2937",
    textAlign: "justify",
  },
  largeTextContainer: {
    marginTop: 8,
    marginBottom: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
  },
  largeTextLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#4B5563",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  largeTextValue: {
    fontSize: 9,
    color: "#1F2937",
    textAlign: "justify",
    lineHeight: 1.4,
  },
  questionBlock: {
    marginTop: 8,
    fontSize: 10,
    paddingLeft: 5,
  },
  questionText: {
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  obsText: {
    marginTop: 4,
    paddingLeft: 10,
    fontSize: 10,
    color: "#374151",
    fontFamily: "Helvetica-Oblique",
  },
  checkboxContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkbox: {
    height: 10,
    width: 10,
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "grey",
  },
});

// --------------------
// COMPONENTES TIPADOS
// --------------------

export const SectionTitle = ({ number, title }: SectionTitleProps) => (
  <Text style={styles.sectionTitle}>{`${number} - ${title}`}</Text>
);

export const DetailItem = ({ label, value }: DetailItemProps) => {
  if (value === null || value === undefined || value === "" || value === "Não Respondida") {
    return null;
  }
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailKey}>{label}:</Text>
      <Text style={styles.detailValue}>{String(value)}</Text>
    </View>
  );
};

export const LargeTextItem = ({ label, value }: DetailItemProps) => {
  if (value === null || value === undefined || value === "" || value === "Não Respondida") {
    return null;
  }
  return (
    <View style={styles.largeTextContainer}>
      <Text style={styles.largeTextLabel}>{label}</Text>
      <Text style={styles.largeTextValue}>{String(value)}</Text>
    </View>
  );
};

export const CheckboxOptions = ({
  question,
  value,
  obs,
  options,
}: CheckboxOptionsProps) => {
  const hasValue = value !== null && value !== undefined && value !== "" && value !== "Não Respondida";

  let displayValue = value;
  if (typeof value === "boolean") {
    displayValue = value ? "Sim" : "Não";
  }

  const normalizedValue =
    typeof displayValue === "string" ? displayValue.trim() : displayValue;

  return (
    <View style={styles.questionBlock}>
      <Text style={styles.questionText}>{question}</Text>

      <View style={styles.checkboxContainer}>
        {options.map((option) => {
          const isSelected = hasValue && normalizedValue === option;

          return (
            <View key={option} style={styles.option}>
              <View style={styles.checkbox}>
                {isSelected ? (
                  <View
                    style={{ width: 5, height: 5, backgroundColor: "black" }}
                  />
                ) : null}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </View>
          );
        })}
      </View>

      {obs && obs !== "Não Respondida" && <Text style={styles.obsText}>Obs.: {obs}</Text>}
    </View>
  );
};
