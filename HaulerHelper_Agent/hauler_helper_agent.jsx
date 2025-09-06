import React, { useState, useEffect } from 'react';

const NUM_AISLES = 10;
const NUM_SLOTS = 15;

const calcDistance = (start, target) => {
  const startEdge = start.slot <= Math.ceil(NUM_SLOTS/2) ? 0 : NUM_SLOTS + 1;
  const targetEdge = target.slot <= Math.ceil(NUM_SLOTS/2) ? 0 : NUM_SLOTS + 1;
  return Math.abs(start.aisle - target.aisle) + Math.abs(startEdge - targetEdge) + Math.abs(targetEdge - target.slot);
};

export default function HaulerHelper() {
  const [pickups, setPickups] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ aisle: 1, slot: 1 });

  useEffect(() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const mockPickups = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      item: `Item ${alphabet[i]}`,
      aisle: Math.floor(Math.random() * NUM_AISLES) + 1,
      slot: Math.floor(Math.random() * NUM_SLOTS) + 1
    }));

    const sorted = mockPickups.sort((a, b) => {
      if (a.aisle === currentLocation.aisle && b.aisle !== currentLocation.aisle) return -1;
      if (b.aisle === currentLocation.aisle && a.aisle !== currentLocation.aisle) return 1;
      return calcDistance(currentLocation, a) - calcDistance(currentLocation, b);
    });

    setPickups(sorted);
  }, [currentLocation]);

  const handlePickupComplete = (id) => {
    const completed = pickups.find(p => p.id === id);
    if (completed) {
      setCurrentLocation({ aisle: completed.aisle, slot: completed.slot });
    }

    const remaining = pickups.filter(p => p.id !== id);
    const sorted = remaining.sort((a, b) => {
      if (a.aisle === completed.aisle && b.aisle !== completed.aisle) return -1;
      if (b.aisle === completed.aisle && a.aisle !== completed.aisle) return 1;
      return calcDistance(completed, a) - calcDistance(completed, b);
    });
    setPickups(sorted);
  };

  const renderMap = () => {
    const route = [currentLocation, ...pickups];
    const grid = [];

    for (let a = 1; a <= NUM_AISLES; a++) {
      const row = [
        <div key={`aisle-${a}`} className="w-6 h-6 flex items-center justify-center text-xs font-semibold">{a}</div>
      ];
      for (let s = 1; s <= NUM_SLOTS; s++) {
        const isCurrent = currentLocation.aisle === a && currentLocation.slot === s;
        const pickupIndex = pickups.findIndex(p => p.aisle === a && p.slot === s);
        const routeIndex = route.findIndex(p => p.aisle === a && p.slot === s);

        let cellClass = 'bg-gray-100';
        let label = '';
        if (routeIndex !== -1) {
          cellClass = 'bg-green-300';
          label = routeIndex.toString();
        }
        if (pickupIndex !== -1) {
          cellClass = 'bg-blue-400';
        }
        if (isCurrent) {
          cellClass = 'bg-green-500';
          label = 'S';
        }

        row.push(
          <div key={`${a}-${s}`} className={`w-6 h-6 border text-xs flex items-center justify-center ${cellClass}`}>{label}</div>
        );
      }
      grid.push(<div key={a} className="flex gap-0.5 items-center my-2.25">{row}</div>);
    }

    const slotRow = [
      <div key="empty-corner" className="w-6 h-6"></div>
    ];
    for (let s = 1; s <= NUM_SLOTS; s++) {
      slotRow.push(
        <div key={`slot-${s}`} className="w-6 h-6 flex items-center justify-center text-xs font-semibold">{s}</div>
      );
    }
    grid.push(<div key="slot-numbers" className="flex gap-0.5 mt-1 items-center">{slotRow}</div>);

    return grid;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex gap-2">
        {/* Left half: Pickup List */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex justify-center mb-2">
              <h1 className="text-2xl font-bold">Order of Pickup</h1>
            </div>
            {pickups.map((p, index) => (
              <div key={p.id} className="border-b py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{index + 1}. {p.item}</p>
                  <p className="text-sm text-gray-600">Aisle: {p.aisle}, Slot: {p.slot}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 text-sm">Distance: {calcDistance(currentLocation, p)}</span>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    onClick={() => handlePickupComplete(p.id)}
                  >
                    Complete
                  </button>
                </div>
              </div>
            ))}
            {pickups.length === 0 && <p className="text-center text-gray-500">All pickups completed!</p>}
          </div>
        </div>

        {/* Right half: Map with visual labels */}
        <div className="flex-1 bg-white rounded-2xl shadow p-4 overflow-auto">
          <div className="flex justify-center mb-2">
            <h1 className="text-2xl font-bold">Distribution Center Map</h1>
          </div>
          <div className="flex gap-0.5">
            <div className="flex flex-col justify-start text-xs font-semibold mr-1 mt-8"></div>
            <div className="flex flex-col">
              {renderMap()}
              <div className="flex justify-start text-xs font-semibold mt-1 ml-7"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
