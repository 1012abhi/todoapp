import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createTodo,
  deleteTodo,
  getTodos,
  Todo,
  updateTodo,
} from "../../services/todoService";

import { useAuth } from "../../context/AuthContext";

type Priority = "low" | "medium" | "high";

const HomeScreen = () => {
  const { user, logout } = useAuth();

  // ==========================================
  // TODO STATE
  // ==========================================

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================
  // MODAL STATE
  // ==========================================

  const [modalVisible, setModalVisible] =
    useState(false);

  const [addingTodo, setAddingTodo] =
    useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [dateTime, setDateTime] =
    useState<Date | null>(null);

  const [deadline, setDeadline] =
    useState<Date | null>(null);

  const [priority, setPriority] =
    useState<Priority>("medium");

  // ==========================================
  // IOS DATE PICKER STATE
  // ==========================================

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showDeadlinePicker, setShowDeadlinePicker] =
    useState(false);

  // ==========================================
  // FETCH TODOS
  // ==========================================

  const fetchTodos = useCallback(async () => {
    try {
      const response = await getTodos();

      setTodos(response?.todos || []);
    } catch (error: any) {
      console.log(
        "GET TODOS ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load todos"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDateTime(null);
    setDeadline(null);
    setPriority("medium");

    setShowDatePicker(false);
    setShowDeadlinePicker(false);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (addingTodo) {
      return;
    }

    setShowDatePicker(false);
    setShowDeadlinePicker(false);

    resetForm();

    setModalVisible(false);
  };

  // ==========================================
  // OPEN DATE & TIME PICKER
  // ==========================================

  const openDatePicker = () => {
    if (addingTodo) {
      return;
    }

    const initialDate =
      dateTime || new Date();

    // ----------------------------------------
    // ANDROID
    // ----------------------------------------

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: "date",
        is24Hour: false,

        onChange: (
          event,
          selectedDate
        ) => {
          if (
            event.type !== "set" ||
            !selectedDate
          ) {
            return;
          }

          // Open time picker after date
          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            is24Hour: false,

            onChange: (
              timeEvent,
              selectedTime
            ) => {
              if (
                timeEvent.type !== "set" ||
                !selectedTime
              ) {
                return;
              }

              const finalDate =
                new Date(selectedDate);

              finalDate.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                0,
                0
              );

              setDateTime(finalDate);

              // Deadline can no longer be
              // before task date
              if (
                deadline &&
                deadline < finalDate
              ) {
                setDeadline(null);
              }
            },
          });
        },
      });

      return;
    }

    // ----------------------------------------
    // IOS
    // ----------------------------------------

    setShowDatePicker(true);
  };

  // ==========================================
  // OPEN DEADLINE PICKER
  // ==========================================

  const openDeadlinePicker = () => {
    if (addingTodo) {
      return;
    }

    const initialDate =
      deadline ||
      dateTime ||
      new Date();

    // ----------------------------------------
    // ANDROID
    // ----------------------------------------

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: "date",
        minimumDate:
          dateTime || undefined,
        is24Hour: false,

        onChange: (
          event,
          selectedDate
        ) => {
          if (
            event.type !== "set" ||
            !selectedDate
          ) {
            return;
          }

          DateTimePickerAndroid.open({
            value: selectedDate,
            mode: "time",
            is24Hour: false,

            onChange: (
              timeEvent,
              selectedTime
            ) => {
              if (
                timeEvent.type !== "set" ||
                !selectedTime
              ) {
                return;
              }

              const finalDeadline =
                new Date(selectedDate);

              finalDeadline.setHours(
                selectedTime.getHours(),
                selectedTime.getMinutes(),
                0,
                0
              );

              if (
                dateTime &&
                finalDeadline < dateTime
              ) {
                Alert.alert(
                  "Invalid Deadline",
                  "Deadline cannot be before the task date and time."
                );

                return;
              }

              setDeadline(
                finalDeadline
              );
            },
          });
        },
      });

      return;
    }

    // ----------------------------------------
    // IOS
    // ----------------------------------------

    setShowDeadlinePicker(true);
  };

  // ==========================================
  // ADD TODO
  // ==========================================

  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Error",
        "Please enter a todo title"
      );

      return;
    }

    // Deadline validation
    if (
      dateTime &&
      deadline &&
      deadline < dateTime
    ) {
      Alert.alert(
        "Invalid Deadline",
        "Deadline cannot be before the task date and time."
      );

      return;
    }

    try {
      setAddingTodo(true);

      const response = await createTodo({
        title: title.trim(),

        description:
          description.trim() || undefined,

        dateTime:
          dateTime
            ? dateTime.toISOString()
            : undefined,

        deadline:
          deadline
            ? deadline.toISOString()
            : undefined,

        priority,
      });

      if (response?.todo) {
        setTodos((currentTodos) => [
          response.todo,
          ...currentTodos,
        ]);
      }

      resetForm();
      setModalVisible(false);
    } catch (error: any) {
      console.log(
        "CREATE TODO ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create todo"
      );
    } finally {
      setAddingTodo(false);
    }
  };

  // ==========================================
  // TOGGLE TODO
  // ==========================================

  const handleToggleTodo = async (
    todo: Todo
  ) => {
    try {
      const response = await updateTodo(
        todo._id,
        {
          completed: !todo.completed,
        }
      );

      if (!response?.todo) {
        return;
      }

      setTodos((currentTodos) =>
        currentTodos.map((item) =>
          item._id === todo._id
            ? response.todo
            : item
        )
      );
    } catch (error: any) {
      console.log(
        "UPDATE TODO ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update todo"
      );
    }
  };

  // ==========================================
  // DELETE TODO
  // ==========================================

  const handleDeleteTodo = (
    todo: Todo
  ) => {
    Alert.alert(
      "Delete Todo",

      `Are you sure you want to delete "${todo.title}"?`,

      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              await deleteTodo(
                todo._id
              );

              setTodos(
                (currentTodos) =>
                  currentTodos.filter(
                    (item) =>
                      item._id !==
                      todo._id
                  )
              );
            } catch (error: any) {
              console.log(
                "DELETE TODO ERROR:",
                error
              );

              Alert.alert(
                "Error",
                error?.response?.data
                  ?.message ||
                  error?.message ||
                  "Failed to delete todo"
              );
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // FORMAT FORM DATE
  // ==========================================

  const formatFormDate = (
    value: Date | null
  ) => {
    if (!value) {
      return "";
    }

    return value.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // PRIORITY LABEL
  // ==========================================

  const getPriorityLabel = (
    value: Priority
  ) => {
    if (value === "high") {
      return "HIGH";
    }

    if (value === "low") {
      return "LOW";
    }

    return "MEDIUM";
  };

  // ==========================================
  // RENDER TODO
  // ==========================================

  const renderTodo = ({
    item,
  }: {
    item: Todo;
  }) => {
    return (
      <View style={styles.todoCard}>
        {/* CHECKBOX */}

        <TouchableOpacity
          style={[
            styles.checkbox,

            item.completed &&
              styles.checkboxCompleted,
          ]}
          onPress={() =>
            handleToggleTodo(item)
          }
        >
          {item.completed && (
            <Text
              style={styles.checkmark}
            >
              ✓
            </Text>
          )}
        </TouchableOpacity>

        {/* CONTENT */}

        <View style={styles.todoContent}>
          <Text
            style={[
              styles.todoTitle,

              item.completed &&
                styles.completedTitle,
            ]}
          >
            {item.title}
          </Text>

          {item.description ? (
            <Text
              style={[
                styles.todoDescription,

                item.completed &&
                  styles.completedDescription,
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}

          {/* DATE */}

          {item.dateTime ? (
            <Text style={styles.todoMeta}>
              📅{" "}
              {formatDate(
                item.dateTime
              )}
            </Text>
          ) : null}

          {/* DEADLINE */}

          {item.deadline ? (
            <Text style={styles.todoMeta}>
              ⏰ Deadline:{" "}
              {formatDate(
                item.deadline
              )}
            </Text>
          ) : null}

          {/* PRIORITY */}

          <View style={styles.priorityRow}>
            <View
              style={[
                styles.priorityDot,

                item.priority ===
                  "high" &&
                  styles.highDot,

                item.priority ===
                  "medium" &&
                  styles.mediumDot,

                item.priority ===
                  "low" &&
                  styles.lowDot,
              ]}
            />

            <Text
              style={styles.priorityText}
            >
              {getPriorityLabel(
                item.priority
              )}
            </Text>
          </View>
        </View>

        {/* DELETE */}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            handleDeleteTodo(item)
          }
        >
          <Text style={styles.deleteText}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
          />

          <Text
            style={styles.loadingText}
          >
            Loading todos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // HOME SCREEN
  // ==========================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text
            style={styles.greeting}
            numberOfLines={1}
          >
            Hi, {user?.name || "there"} 👋
          </Text>

          <Text style={styles.subtitle}>
            Manage your tasks
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              "Logout",
              "Are you sure you want to logout?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },

                {
                  text: "Logout",
                  style: "destructive",
                  onPress: logout,
                },
              ]
            );
          }}
        >
          <Text
            style={styles.logoutText}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST HEADER */}

      <View style={styles.listHeader}>
        <Text
          style={styles.sectionTitle}
        >
          My Tasks
        </Text>

        <Text style={styles.taskCount}>
          {todos.length}{" "}
          {todos.length === 1
            ? "task"
            : "tasks"}
        </Text>
      </View>

      {/* TODO LIST */}

      <FlatList
        data={todos}
        keyExtractor={(item) =>
          item._id
        }
        renderItem={renderTodo}
        contentContainerStyle={
          todos.length === 0
            ? styles.emptyList
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <Text style={styles.emptyIcon}>
              ✓
            </Text>

            <Text
              style={styles.emptyTitle}
            >
              No tasks yet
            </Text>

            <Text
              style={styles.emptyText}
            >
              Create your first task to
              get started.
            </Text>

            <TouchableOpacity
              style={
                styles.emptyButton
              }
              onPress={() =>
                setModalVisible(true)
              }
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                Add Your First Task
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FLOATING ADD BUTTON */}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          setModalVisible(true)
        }
      >
        <Text
          style={styles.addButtonText}
        >
          +
        </Text>
      </TouchableOpacity>

      {/* ADD TODO MODAL */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={styles.modalContainer}
          >
            {/* MODAL HEADER */}

            <View
              style={styles.modalHeader}
            >
              <Text
                style={styles.modalTitle}
              >
                Add Task
              </Text>

              <TouchableOpacity
                onPress={closeModal}
                disabled={addingTodo}
              >
                <Text
                  style={styles.closeButton}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* TITLE */}

            <TextInput
              style={styles.modalInput}
              placeholder="Task title"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
              editable={!addingTodo}
              autoFocus
            />

            {/* DESCRIPTION */}

            <TextInput
              style={[
                styles.modalInput,
                styles.descriptionInput,
              ]}
              placeholder="Description (optional)"
              placeholderTextColor="#888"
              value={description}
              onChangeText={
                setDescription
              }
              editable={!addingTodo}
              multiline
              textAlignVertical="top"
            />

            {/* DATE & TIME */}

            <TouchableOpacity
              style={styles.dateButton}
              onPress={openDatePicker}
              disabled={addingTodo}
            >
              <View>
                <Text
                  style={
                    styles.dateButtonLabel
                  }
                >
                  Date & Time
                </Text>

                <Text
                  style={
                    styles.dateButtonValue
                  }
                >
                  {dateTime
                    ? formatFormDate(
                        dateTime
                      )
                    : "Select date & time"}
                </Text>
              </View>

              <Text
                style={styles.calendarIcon}
              >
                📅
              </Text>
            </TouchableOpacity>

            {/* IOS DATE PICKER */}

            {Platform.OS === "ios" &&
              showDatePicker && (
                <DateTimePicker
                  value={
                    dateTime ||
                    new Date()
                  }
                  mode="datetime"
                  display="spinner"
                  onChange={(
                    event,
                    selectedDate
                  ) => {
                    if (
                      event.type ===
                        "set" &&
                      selectedDate
                    ) {
                      setDateTime(
                        selectedDate
                      );

                      if (
                        deadline &&
                        deadline <
                          selectedDate
                      ) {
                        setDeadline(
                          null
                        );
                      }
                    }

                    setShowDatePicker(
                      false
                    );
                  }}
                />
              )}

            {/* DEADLINE */}

            <TouchableOpacity
              style={styles.dateButton}
              onPress={
                openDeadlinePicker
              }
              disabled={addingTodo}
            >
              <View>
                <Text
                  style={
                    styles.dateButtonLabel
                  }
                >
                  Deadline
                </Text>

                <Text
                  style={
                    styles.dateButtonValue
                  }
                >
                  {deadline
                    ? formatFormDate(
                        deadline
                      )
                    : "Select deadline"}
                </Text>
              </View>

              <Text
                style={styles.calendarIcon}
              >
                ⏰
              </Text>
            </TouchableOpacity>

            {/* IOS DEADLINE PICKER */}

            {Platform.OS === "ios" &&
              showDeadlinePicker && (
                <DateTimePicker
                  value={
                    deadline ||
                    dateTime ||
                    new Date()
                  }
                  mode="datetime"
                  display="spinner"
                  minimumDate={
                    dateTime ||
                    undefined
                  }
                  onChange={(
                    event,
                    selectedDate
                  ) => {
                    if (
                      event.type ===
                        "set" &&
                      selectedDate
                    ) {
                      if (
                        dateTime &&
                        selectedDate <
                          dateTime
                      ) {
                        Alert.alert(
                          "Invalid Deadline",
                          "Deadline cannot be before the task date and time."
                        );
                      } else {
                        setDeadline(
                          selectedDate
                        );
                      }
                    }

                    setShowDeadlinePicker(
                      false
                    );
                  }}
                />
              )}

            {/* PRIORITY */}

            <Text
              style={styles.priorityLabel}
            >
              Priority
            </Text>

            <View
              style={
                styles.prioritySelector
              }
            >
              {(
                [
                  "low",
                  "medium",
                  "high",
                ] as Priority[]
              ).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.priorityOption,

                    priority === value &&
                      styles.priorityOptionSelected,
                  ]}
                  onPress={() =>
                    setPriority(value)
                  }
                  disabled={addingTodo}
                >
                  <View
                    style={[
                      styles.radioCircle,

                      priority ===
                        value &&
                        styles.radioCircleSelected,
                    ]}
                  />

                  <Text
                    style={[
                      styles.priorityOptionText,

                      priority ===
                        value &&
                        styles.priorityOptionTextSelected,
                    ]}
                  >
                    {value
                      .charAt(0)
                      .toUpperCase() +
                      value.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CREATE BUTTON */}

            <TouchableOpacity
              style={[
                styles.createButton,

                addingTodo &&
                  styles.buttonDisabled,
              ]}
              onPress={handleAddTodo}
              disabled={addingTodo}
            >
              {addingTodo ? (
                <ActivityIndicator
                  color="#FFF"
                />
              ) : (
                <Text
                  style={
                    styles.createButtonText
                  }
                >
                  Add Task
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  // ========================================
  // HEADER
  // ========================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
  },

  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },

  logoutButton: {
    marginLeft: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#EAEAEA",
  },

  logoutText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
  },

  // ========================================
  // LIST HEADER
  // ========================================

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  taskCount: {
    fontSize: 14,
    color: "#777",
  },

  list: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // ========================================
  // TODO CARD
  // ========================================

  todoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },

  checkboxCompleted: {
    backgroundColor: "#111",
  },

  checkmark: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },

  todoContent: {
    flex: 1,
    minWidth: 0,
  },

  todoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  completedTitle: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  todoDescription: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
    lineHeight: 18,
  },

  completedDescription: {
    textDecorationLine: "line-through",
    color: "#AAA",
  },

  todoMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 7,
  },

  // ========================================
  // PRIORITY
  // ========================================

  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  highDot: {
    backgroundColor: "#D11A2A",
  },

  mediumDot: {
    backgroundColor: "#E0A800",
  },

  lowDot: {
    backgroundColor: "#28A745",
  },

  priorityText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },

  // ========================================
  // DELETE
  // ========================================

  deleteButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  deleteText: {
    color: "#D11A2A",
    fontSize: 13,
    fontWeight: "600",
  },

  // ========================================
  // ADD BUTTON
  // ========================================

  addButton: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  addButtonText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 36,
  },

  // ========================================
  // LOADING
  // ========================================

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 14,
  },

  // ========================================
  // EMPTY
  // ========================================

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EAEAEA",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 32,
    color: "#111",
    overflow: "hidden",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginTop: 18,
  },

  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 20,
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ========================================
  // MODAL
  // ========================================

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0, 0, 0, 0.4)",
  },

  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  closeButton: {
    fontSize: 20,
    color: "#777",
  },

  modalInput: {
    height: 54,
    backgroundColor: "#F7F7F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
    marginBottom: 14,
  },

  descriptionInput: {
    height: 90,
    paddingTop: 15,
  },

  // ========================================
  // DATE BUTTON
  // ========================================

  dateButton: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  dateButtonLabel: {
    fontSize: 12,
    color: "#777",
    marginBottom: 3,
  },

  dateButtonValue: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },

  calendarIcon: {
    fontSize: 20,
  },

  // ========================================
  // PRIORITY SELECTOR
  // ========================================

  priorityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
    marginBottom: 8,
  },

  prioritySelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  priorityOption: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#F7F7F8",
  },

  priorityOptionSelected: {
    borderColor: "#111",
    backgroundColor: "#111",
  },

  radioCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#888",
    marginRight: 6,
  },

  radioCircleSelected: {
    backgroundColor: "#FFF",
    borderColor: "#FFF",
  },

  priorityOptionText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },

  priorityOptionTextSelected: {
    color: "#FFF",
  },

  // ========================================
  // CREATE BUTTON
  // ========================================

  createButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  createButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});