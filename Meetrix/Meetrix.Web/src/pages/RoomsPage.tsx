import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { getRooms } from "../api/room-service";
import { createBooking, getRoomAvailability } from "../api/booking-service";
import { joinWaitlist } from "../api/waitlist-service";
import type { Room } from "../models/Room";
import { useAuth } from "../auth/AuthContext";

type Meridiem = "AM" | "PM";

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookedByUserId?: number | null;
}

interface FacilityOption {
  value: string;
  label: string;
}

const hourOptions = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minuteOptions = ["00", "15", "30", "45"];
const meridiemOptions: Meridiem[] = ["AM", "PM"];

const RoomsPage: React.FC = () => {
  const { auth } = useAuth();
  const currentUserId = auth?.userId;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [accessFilter, setAccessFilter] = useState<"all" | "accessible" | "standard">("all");
  const [capacityFilter, setCapacityFilter] = useState<"any" | "small" | "medium" | "large">("any");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [startMeridiem, setStartMeridiem] = useState<Meridiem>("AM");

  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [endMeridiem, setEndMeridiem] = useState<Meridiem>("AM");

  const [purpose, setPurpose] = useState("");

  const [waitlistLoadingKey, setWaitlistLoadingKey] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getRooms();
        setRooms(data);

        if (data.length > 0) {
          setSelectedRoom(data[0]);
        }
      } catch (err: any) {
        console.error("Failed to load rooms", err);
        setError(
          err?.response?.status === 401
            ? "Not authorized. Please login again."
            : "Failed to load rooms."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedRoom) {
        setSlots([]);
        return;
      }

      try {
        setSlotsLoading(true);
        setSlotsError(null);
        setWaitlistError(null);

        const data = await getRoomAvailability(selectedRoom.roomId, selectedDate);
        setSlots(data?.windows ?? []);
      } catch (err) {
        console.error("Failed to load availability", err);
        setSlots([]);
        setSlotsError("Failed to load room availability.");
      } finally {
        setSlotsLoading(false);
      }
    };

    loadAvailability();
  }, [selectedRoom, selectedDate]);

  const allFacilities = useMemo(() => {
    const values = new Set<string>();

    rooms.forEach((room) => {
      (room.facilities ?? []).forEach((facility) => {
        if (facility?.trim()) {
          values.add(facility.trim());
        }
      });
    });

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [rooms]);

  const facilityOptions = useMemo<FacilityOption[]>(
    () =>
      allFacilities.map((facility) => ({
        value: facility,
        label: facility,
      })),
    [allFacilities]
  );

  const roundToNext15 = (date: Date) => {
    const d = new Date(date);
    const minutes = d.getMinutes();
    const remainder = minutes % 15;

    if (remainder !== 0) {
      d.setMinutes(minutes + (15 - remainder));
    }

    d.setSeconds(0);
    d.setMilliseconds(0);

    return d;
  };

  const now = useMemo(() => roundToNext15(new Date()), []);

  const selectedRoomSlots = useMemo(() => {
    return slots
      .map((slot) => {
        const start = new Date(slot.startTime);
        const end = new Date(slot.endTime);

        if (end <= now) return null;

        if (start < now) {
          return {
            ...slot,
            startTime: now.toISOString(),
          };
        }

        return slot;
      })
      .filter((s): s is AvailabilitySlot => s !== null);
  }, [slots, now]);

  const buildDateTime = (
    date: string,
    hour12: string,
    minute: string,
    meridiem: Meridiem
  ) => {
    if (!hour12 || !minute) return "";

    let hour = parseInt(hour12, 10);

    if (meridiem === "AM") {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    const hour24 = String(hour).padStart(2, "0");
    return `${date}T${hour24}:${minute}:00`;
  };

  const formatTime12Hour = (dateTime: string) => {
    const date = new Date(dateTime);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const meridiem: Meridiem = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${meridiem}`;
  };

  const extract12HourParts = (dateTime: string) => {
    const date = new Date(dateTime);
    let hours = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const meridiem: Meridiem = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return {
      hour: String(hours).padStart(2, "0"),
      minute,
      meridiem,
    };
  };

  const startDateTime = useMemo(
    () => buildDateTime(selectedDate, startHour, startMinute, startMeridiem),
    [selectedDate, startHour, startMinute, startMeridiem]
  );

  const endDateTime = useMemo(
    () => buildDateTime(selectedDate, endHour, endMinute, endMeridiem),
    [selectedDate, endHour, endMinute, endMeridiem]
  );

  const durationLabel = useMemo(() => {
    if (!startDateTime || !endDateTime) return "";

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs <= 0) return "Invalid time range";

    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minutes`;
    }

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    return `${minutes} minutes`;
  }, [startDateTime, endDateTime]);

  const resetBookingForm = () => {
    setStartHour("");
    setStartMinute("");
    setStartMeridiem("AM");
    setEndHour("");
    setEndMinute("");
    setEndMeridiem("AM");
    setPurpose("");
    setBookingError(null);
  };

  const openBookingModal = () => {
    if (!selectedRoom) return;
    resetBookingForm();
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    if (bookingLoading) return;
    setIsBookingModalOpen(false);
    setBookingError(null);
  };

  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (!slot.isAvailable) return;

    const start = new Date(slot.startTime);
    if (start < now) return;

    const startParts = extract12HourParts(slot.startTime);
    const endParts = extract12HourParts(slot.endTime);

    setStartHour(startParts.hour);
    setStartMinute(startParts.minute);
    setStartMeridiem(startParts.meridiem);

    setEndHour(endParts.hour);
    setEndMinute(endParts.minute);
    setEndMeridiem(endParts.meridiem);

    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRoom) {
      setBookingError("Please select a room.");
      return;
    }

    if (!startHour || !startMinute || !endHour || !endMinute) {
      setBookingError("Please select both start and end times.");
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (start < new Date() || end < new Date()) {
      setBookingError("Cannot book past time.");
      return;
    }

    if (start >= end) {
      setBookingError("End time must be after start time.");
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      await createBooking({
        roomId: selectedRoom.roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose: purpose.trim() || undefined,
      });

      setIsBookingModalOpen(false);
      resetBookingForm();

      const updatedAvailability = await getRoomAvailability(
        selectedRoom.roomId,
        selectedDate
      );
      setSlots(updatedAvailability?.windows ?? []);
    } catch (err: any) {
      setBookingError(err?.message || "Failed to create booking.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoinWaitlist = async (slot: AvailabilitySlot) => {
    try {
      if (!selectedRoom) return;

      setWaitlistError(null);
      const slotKey = `${slot.startTime}-${slot.endTime}`;
      setWaitlistLoadingKey(slotKey);

      await joinWaitlist({
        roomId: selectedRoom.roomId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    } catch (err: any) {
      setWaitlistError(err?.message || "Failed to join waitlist.");
    } finally {
      setWaitlistLoadingKey(null);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (!r.roomName.toLowerCase().includes(search.toLowerCase())) return false;

    if (accessFilter === "accessible" && !r.isAccessible) return false;
    if (accessFilter === "standard" && r.isAccessible) return false;

    if (capacityFilter === "small" && !(r.capacity >= 1 && r.capacity <= 4))
      return false;
    if (capacityFilter === "medium" && !(r.capacity >= 5 && r.capacity <= 10))
      return false;
    if (capacityFilter === "large" && !(r.capacity >= 11)) return false;

    if (
      selectedFacilities.length > 0 &&
      !selectedFacilities.every((facility) =>
        (r.facilities ?? []).some(
          (roomFacility) =>
            roomFacility.trim().toLowerCase() === facility.trim().toLowerCase()
        )
      )
    ) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="admin-page rooms-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Find a room</h1>
            <p className="page-subtitle">Loading rooms…</p>
          </div>
        </div>

        <div className="admin-card">
          <p>Loading rooms…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page rooms-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Find a room</h1>
            <p className="page-subtitle">Something went wrong.</p>
          </div>
        </div>

        <div className="admin-card">
          <p style={{ color: "#b91c1c" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page rooms-page">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Find a room</h1>
            <p className="page-subtitle">
              Select a room on the left to view availability and create a booking.
            </p>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="toolbar-left">
            <div className="input-with-label">
              <label>Search rooms</label>
              <input
                type="text"
                placeholder="Search by room name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="input-with-label">
              <label>Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="toolbar-right">
            <div className="input-inline">
              <label>Accessibility</label>
              <select
                value={accessFilter}
                onChange={(e) =>
                  setAccessFilter(
                    e.target.value as "all" | "accessible" | "standard"
                  )
                }
              >
                <option value="all">All</option>
                <option value="accessible">Accessible</option>
                <option value="standard">Standard</option>
              </select>
            </div>

            <div className="input-inline">
              <label>Capacity</label>
              <select
                value={capacityFilter}
                onChange={(e) =>
                  setCapacityFilter(
                    e.target.value as "any" | "small" | "medium" | "large"
                  )
                }
              >
                <option value="any">Any</option>
                <option value="small">1–4</option>
                <option value="medium">5–10</option>
                <option value="large">11+</option>
              </select>
            </div>

            <div className="input-inline facilities-select">
              <label>Facilities</label>
              <Select<FacilityOption, true>
                isMulti
                options={facilityOptions}
                value={facilityOptions.filter((option) =>
                  selectedFacilities.includes(option.value)
                )}
                onChange={(selected) =>
                  setSelectedFacilities(selected.map((item) => item.value))
                }
                placeholder="All facilities"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        <div className="rooms-workspace">
          <div className="rooms-list-column">
            <div className="admin-card">
              {filteredRooms.length === 0 ? (
                <div className="empty-state">
                  <h3>No matching rooms</h3>
                  <p>Try a different search term or filters.</p>
                </div>
              ) : (
                <div className="room-card-grid">
                  {filteredRooms.map((room) => {
                    const isSelected = selectedRoom?.roomId === room.roomId;

                    return (
                      <button
                        key={room.roomId}
                        type="button"
                        className={
                          "room-card" + (isSelected ? " room-card-selected" : "")
                        }
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div className="room-card-header">
                          <div>
                            <h3 className="room-card-title">{room.roomName}</h3>
                            <p className="room-card-subtitle">
                              Floor {room.floor ?? 0} · {room.capacity} seats
                            </p>
                          </div>

                          <span
                            className={`badge ${
                              room.isAccessible ? "badge-success-light" : "badge-muted"
                            }`}
                          >
                            {room.isAccessible ? "Accessible" : "Standard"}
                          </span>
                        </div>

                        <p className="room-card-description">
                          {room.description || "No description provided."}
                        </p>

                        {room.facilities?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              marginBottom: 8,
                            }}
                          >
                            {room.facilities.map((facility) => (
                              <span key={facility} className="badge badge-neutral">
                                {facility}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="room-card-footer">
                          <span className="room-card-footer-text">
                            View details & availability
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rooms-side-column">
            <div className="admin-card selected-room-panel">
              {!selectedRoom ? (
                <div className="empty-state">
                  <h3>Select a room</h3>
                  <p>Choose a room from the left to see availability and book it.</p>
                </div>
              ) : (
                <div className="selected-room-content">
                  <div className="room-card-header">
                    <div>
                      <h2 className="panel-title">{selectedRoom.roomName}</h2>
                      <p className="panel-subtitle">
                        Floor {selectedRoom.floor ?? 0} · {selectedRoom.capacity} seats
                      </p>
                    </div>

                    {selectedRoom.isAccessible && (
                      <span className="badge badge-success-light">Accessible</span>
                    )}
                  </div>

                  <p className="room-card-description">
                    {selectedRoom.description || "No description provided."}
                  </p>

                  {selectedRoom.facilities?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      {selectedRoom.facilities.map((facility) => (
                        <span key={facility} className="badge badge-neutral">
                          {facility}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="schedule-actions" style={{ marginBottom: 12 }}>
                    <button
                      className="btn-primary"
                      type="button"
                      onClick={openBookingModal}
                    >
                      Book this room
                    </button>
                  </div>

                  {slotsLoading ? (
                    <div className="empty-state">
                      <h3>Loading availability...</h3>
                    </div>
                  ) : slotsError ? (
                    <div className="empty-state">
                      <h3>Could not load schedule</h3>
                      <p>{slotsError}</p>
                    </div>
                  ) : selectedRoomSlots.length === 0 ? (
                    <div className="empty-state">
                      <h3>No slots available</h3>
                      <p>No availability data found for this date.</p>
                    </div>
                  ) : (
                    <>
                      <div className="schedule-legend">
                        <span className="legend-item">
                          <span className="legend-dot legend-dot-available" />
                          Available
                        </span>
                        <span className="legend-item">
                          <span className="legend-dot legend-dot-busy" />
                          Booked
                        </span>
                      </div>

                      <div className="selected-room-content">
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            gap: 8,
                          }}
                        >
                          {selectedRoomSlots.map((slot) => {
                            const slotKey = `${slot.startTime}-${slot.endTime}`;
                            const canJoinWaitlist =
                              !slot.isAvailable &&
                              slot.bookedByUserId !== currentUserId;

                            return (
                              <div
                                key={slotKey}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 6,
                                  minWidth: 0,
                                }}
                              >
                                <button
                                  type="button"
                                  className={`slot ${slot.isAvailable ? "available" : "busy"}`}
                                  onClick={() => slot.isAvailable && handleSlotClick(slot)}
                                  disabled={!slot.isAvailable}
                                  title={`${formatTime12Hour(slot.startTime)} - ${formatTime12Hour(
                                    slot.endTime
                                  )}`}
                                  style={{ cursor: slot.isAvailable ? "pointer" : "default" }}
                                >
                                  {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                                </button>

                                {canJoinWaitlist && (
                                  <button
                                    type="button"
                                    className="btn-ghost btn-xs"
                                    onClick={() => handleJoinWaitlist(slot)}
                                    disabled={waitlistLoadingKey === slotKey}
                                  >
                                    {waitlistLoadingKey === slotKey ? "Joining..." : "Join Waitlist"}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {waitlistError && <p className="form-error">{waitlistError}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && selectedRoom && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="modal-title">Book {selectedRoom.roomName}</h2>
            <p className="modal-subtitle">
              Select your start and end time for {selectedDate}.
            </p>

            <form onSubmit={handleCreateBooking}>
              <div className="modal-body">
                <div className="form-field">
                  <label>Start Time</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                    >
                      <option value="">Hour</option>
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                    >
                      <option value="">Minute</option>
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>

                    <select
                      value={startMeridiem}
                      onChange={(e) => setStartMeridiem(e.target.value as Meridiem)}
                    >
                      {meridiemOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>End Time</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                    >
                      <option value="">Hour</option>
                      {hourOptions.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(e.target.value)}
                    >
                      <option value="">Minute</option>
                      {minuteOptions.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>

                    <select
                      value={endMeridiem}
                      onChange={(e) => setEndMeridiem(e.target.value as Meridiem)}
                    >
                      {meridiemOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="purpose">Purpose</label>
                  <input
                    id="purpose"
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Team sync, planning, interview..."
                  />
                </div>

                {durationLabel && (
                  <div className="badge badge-neutral">Duration: {durationLabel}</div>
                )}

                {bookingError && <p className="form-error">{bookingError}</p>}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={closeBookingModal}
                  disabled={bookingLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomsPage;