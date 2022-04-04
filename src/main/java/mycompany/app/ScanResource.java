package src.main.java.mycompany.app;
import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Scanner;
import java.util.Map.Entry;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

public class ScanResource {
    int fileCount = 0;
    int opCount = 0;
    Map<String, List<String>> operationLocation = new HashMap<String, List<String>>();

    public static void main(String... args) throws IOException {
        File dir = new File("../azure-rest-api-specs/specification");
        ScanResource sc = new ScanResource();
        sc.showFiles(dir.listFiles());
        System.out.println(sc.fileCount);
        System.out.println(sc.opCount);
        FileOutputStream fos = new FileOutputStream("map.ser");
        ObjectOutputStream oos = new ObjectOutputStream(fos);
        oos.writeObject(sc.operationLocation);
        oos.close();
        ObjectWriter ow = new ObjectMapper().writer().withDefaultPrettyPrinter();
        String json = ow.writeValueAsString(sc.operationLocation);
        BufferedWriter writer = new BufferedWriter(new FileWriter("operationAddress.json"));
        writer.write(json);

        writer.close();
    }

    public void showFiles(File[] files) {
        for (File file : files) {
            if (file.isDirectory()) {
                showFiles(file.listFiles());
            } else {
                this.fileCount++;
                String path = file.getAbsolutePath();
                String extension = getExtensionByStringHandling(path).orElseThrow(IllegalArgumentException::new);
                if (extension.compareToIgnoreCase("JSON") == 0) {
                    findFile(file);
                    if (opCount > 100)
                        return;
                }
            }
        }
    }

    public static Optional<String> getExtensionByStringHandling(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(filename.lastIndexOf(".") + 1));
    }

    public void findFile(File file) {
        try (Scanner scanner = new Scanner(file)) {

            // now read the file line by line...
            int lineNum = 0;
            while (scanner.hasNextLine()) {
                String line = scanner.nextLine();
                lineNum++;
                if (lineNum == 2 && !line.contains("swagger")) {
                    return;
                }
                if (line.contains("\"operationId\":")) {
                    opCount++;
                    if (opCount % 100 == 0)
                        System.out.println(opCount);
                    int index = line.indexOf("\"operationId\":") + 14;
                    int start = line.indexOf("\"", index);
                    int end = line.indexOf("\"", start + 1);
                    String operationId = line.substring(start + 1, end);
                    if (operationLocation.containsKey(operationId)) {
                        operationLocation.get(operationId).add(file.getAbsolutePath());
                    } else {
                        List<String> list = new ArrayList<>();
                        list.add(file.getAbsolutePath());
                        operationLocation.put(operationId, list);
                    }
                }
            }
        } catch (FileNotFoundException e) {
            // handle this
        }
    }

    public void writeCsv() {
        String eol = System.getProperty("line.separator");

        try (Writer writer = new FileWriter("somefile.csv")) {
            for (Entry<String, List<String>> entry : operationLocation.entrySet()) {
                writer.append(entry.getKey())
                        .append(',')
                        .append(entry.getValue().get(0))
                        .append(eol);
            }
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
        }
    }
}
