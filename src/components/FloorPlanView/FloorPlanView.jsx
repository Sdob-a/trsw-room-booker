// src/components/FloorPlanView/FloorPlanView.jsx - Interactive Architectural Floor Plans
import { useState } from 'react';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Users, 
  Info, 
  Check, 
  Wrench, 
  Plus, 
  Flame, 
  Music, 
  Monitor, 
  Palette, 
  BookOpen, 
  Utensils, 
  Briefcase,
  Lock
} from 'lucide-react';
import { BUILDINGS_CONFIG } from '../../floorPlanData';
import './FloorPlanView.css';

const FloorPlanView = ({
  rooms = [],
  bookingsMap = {},
  maintenanceMap = {},
  selectedRoomIds = [],
  onToggleRoom,
  onInspectRoom,
  activeBuildingId = 'senior-school',
  onChangeBuilding
}) => {
  const [selectedFloorId, setSelectedFloorId] = useState('ground'); // 'ground' | 'first' | 'second' | 'all'

  const activeBuilding = BUILDINGS_CONFIG.find(b => b.id === activeBuildingId) || BUILDINGS_CONFIG[0];
  const roomsMap = Object.fromEntries(rooms.map(r => [r.id, r]));

  const getRoomIcon = (type) => {
    switch (type) {
      case 'Science Lab':
        return <Flame size={14} className="room-icon-svg" />;
      case 'IT Computer Suite':
        return <Monitor size={14} className="room-icon-svg" />;
      case 'Music & Audio':
      case 'Music':
        return <Music size={14} className="room-icon-svg" />;
      case 'Art & Design':
        return <Palette size={14} className="room-icon-svg" />;
      case 'Library / Resource Centre':
        return <BookOpen size={14} className="room-icon-svg" />;
      case 'Specialist Workshop':
        return <Utensils size={14} className="room-icon-svg" />;
      case 'Meeting / Conference':
      case 'Assembly Hall':
        return <Briefcase size={14} className="room-icon-svg" />;
      default:
        return null;
    }
  };

  const renderRoomBox = (item) => {
    if (item.isCluster) {
      return (
        <div 
          key={item.clusterItems.map(c => c.roomId || c.label).join('-')}
          className="cluster-room-cell"
          style={{ flex: item.span || 1 }}
        >
          {item.clusterItems.map(subItem => renderRoomBox({ ...subItem, span: 1 }))}
        </div>
      );
    }

    if (item.isStatic) {
      let staticClass = 'static-cell';
      if (item.type === 'toilet') staticClass += ' toilet-cell';
      else if (item.type === 'stairs') staticClass += ' stairs-cell';
      else if (item.type === 'entrance' || item.type === 'exit') staticClass += ' portal-cell';
      else if (item.type === 'prep' || item.type === 'office') staticClass += ' office-cell';
      else if (item.type === 'hall') staticClass += ' hall-cell';

      return (
        <div 
          key={item.label}
          className={`floor-plan-cell ${staticClass}`}
          style={{ flex: item.span || 1 }}
          title={item.label}
        >
          <span className="static-label">{item.label}</span>
        </div>
      );
    }

    const roomId = item.roomId;
    const roomInfo = roomsMap[roomId] || {};
    const booking = bookingsMap[roomId];
    const maintenance = maintenanceMap[roomId];
    const isSelected = selectedRoomIds.includes(roomId);
    const isBooked = !!booking;
    const isMaintenance = !!maintenance;
    const isUnbookable = roomInfo.isBookable === false;

    let statusClass = 'available';
    if (isUnbookable) statusClass = 'unbookable';
    else if (isSelected) statusClass = 'selected';
    else if (isMaintenance) statusClass = 'maintenance';
    else if (isBooked) statusClass = 'booked';

    let statusTooltip = `${item.label} - Available (Click to select)`;
    if (isUnbookable) {
      statusTooltip = `${item.label} - Non-Bookable Space (${roomInfo.unbookableReason || 'Restricted Space'})`;
    } else if (isMaintenance) {
      statusTooltip = `${item.label} - Out of Order: ${maintenance.reason}`;
    } else if (isBooked) {
      statusTooltip = `${item.label} - Booked by ${booking.bookedBy} (${booking.purpose || 'Session'})`;
    } else if (isSelected) {
      statusTooltip = `${item.label} - Selected for booking`;
    }

    const handleClick = () => {
      if (isUnbookable) {
        if (roomInfo.id) onInspectRoom(roomInfo);
        return;
      }
      if (!isMaintenance) {
        onToggleRoom(roomId);
      }
    };

    return (
      <div
        key={roomId}
        className={`floor-plan-cell interactive-room ${statusClass}`}
        style={{ flex: item.span || 1 }}
        onClick={handleClick}
        title={statusTooltip}
      >
        <div className="room-cell-top">
          <div className="room-code-group">
            {isUnbookable ? (
              <Lock size={15} className="text-muted flex-shrink-0" />
            ) : (
              getRoomIcon(item.type || roomInfo.type)
            )}
            <strong className="room-code-text">{item.label}</strong>
          </div>
        </div>

        {item.sublabel && (
          <span className="room-sublabel">{item.sublabel}</span>
        )}

        <div className="room-cell-bottom">
          <div className="status-badge-wrap">
            {isUnbookable ? (
              <div className="room-status-badge unbookable">
                <Lock size={11} />
                <span>Unbookable</span>
              </div>
            ) : isMaintenance ? (
              <div className="room-status-badge maintenance">
                <Wrench size={11} />
                <span>Closed</span>
              </div>
            ) : isBooked ? (
              <div className="room-status-badge booked">
                <span className="status-dot-sm red"></span>
                <span className="booker-name">{booking.bookedBy?.split(' ')[0]}</span>
              </div>
            ) : isSelected ? (
              <div className="room-status-badge selected">
                <Check size={12} />
                <span>Selected</span>
              </div>
            ) : (
              <div className="room-status-badge available">
                <Plus size={11} />
                <span>Free</span>
              </div>
            )}
          </div>

          <div className="room-actions-micro">
            {roomInfo.capacity && (
              <span className="capacity-pill" title={`Capacity: ${roomInfo.capacity} people`}>
                <Users size={11} />
                <span>{roomInfo.capacity}</span>
              </span>
            )}
            <button
              type="button"
              className="room-info-trigger"
              onClick={(e) => {
                e.stopPropagation();
                if (roomInfo.id) onInspectRoom(roomInfo);
              }}
              title="Inspect specifications"
            >
              <Info size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const floorsToRender = selectedFloorId === 'all'
    ? activeBuilding.floors
    : activeBuilding.floors.filter(f => f.id === selectedFloorId);

  return (
    <div className="floor-plan-container glass-panel">
      {/* Top Building & Floor Navigation */}
      <div className="floor-plan-header">
        <div className="building-tabs-row">
          <span className="building-select-label">
            <Building2 size={16} className="text-brand" />
            <span>Select Building:</span>
          </span>
          <div className="building-pills-list">
            {BUILDINGS_CONFIG.map(bldg => (
              <button
                key={bldg.id}
                type="button"
                className={`building-pill ${activeBuilding.id === bldg.id ? 'active' : ''}`}
                onClick={() => {
                  onChangeBuilding(bldg.id);
                  setSelectedFloorId('ground');
                }}
              >
                <span>{bldg.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="floor-options-row">
          {activeBuilding.floors.length > 1 && (
            <div className="floor-tabs-group">
              <span className="floor-label">Floor:</span>
              {activeBuilding.floors.map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`floor-btn ${selectedFloorId === f.id ? 'active' : ''}`}
                  onClick={() => setSelectedFloorId(f.id)}
                >
                  {f.name}
                </button>
              ))}
              <button
                type="button"
                className={`floor-btn ${selectedFloorId === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFloorId('all')}
              >
                All Floors Stacked
              </button>
            </div>
          )}


        </div>
      </div>

      {/* Building Subtitle Banner */}
      <div className="building-info-bar">
        <div>
          <h3 className="building-main-title">{activeBuilding.name}</h3>
          <p className="building-subtitle-text">{activeBuilding.subtitle}</p>
        </div>
        <div className="map-legend">
          <div className="legend-item"><span className="legend-dot green"></span><span>Available</span></div>
          <div className="legend-item"><span className="legend-dot purple"></span><span>Selected</span></div>
          <div className="legend-item"><span className="legend-dot red"></span><span>Booked</span></div>
          <div className="legend-item"><span className="legend-dot orange"></span><span>Maintenance</span></div>
          <div className="legend-item"><span className="legend-dot gray-lock"></span><span>Unbookable (Policy)</span></div>
        </div>
      </div>



      {/* Floors Visual Plan */}
      <div className="floors-display-wrapper">
        {floorsToRender.map(floor => (
          <div key={floor.id} className="floor-card-block">
            <div className="floor-card-header">
              <div className="floor-title-line">
                <span className="floor-badge">{floor.name}</span>
                <span className="floor-desc">{floor.description}</span>
              </div>
            </div>

            <div className="floor-plan-schematic">
              {floor.rows ? (
                floor.rows.map((rowGroup, rIdx) => (
                  <div key={rIdx} className="floor-row-group">
                    {rowGroup.label && (
                      <div className="department-row-label">
                        <span>{rowGroup.label}</span>
                      </div>
                    )}
                    <div className="floor-row rooms-row">
                      {rowGroup.rooms.map(item => renderRoomBox(item))}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Top Row of Rooms */}
                  {floor.topRow && floor.topRow.length > 0 && (
                    <div className="floor-row rooms-row top-rooms">
                      {floor.topRow.map(item => renderRoomBox(item))}
                    </div>
                  )}

                  {/* Bottom Row of Rooms */}
                  {floor.bottomRow && floor.bottomRow.length > 0 && (
                    <div className="floor-row rooms-row bottom-rooms">
                      {floor.bottomRow.map(item => renderRoomBox(item))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorPlanView;
