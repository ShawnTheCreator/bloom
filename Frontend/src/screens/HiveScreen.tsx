import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, MapPin, ShoppingBag, Truck, ArrowRight, Zap, LucideIcon } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

interface HiveActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  participants: number;
  maxParticipants: number;
  savings: string;
  organizerName: string;
  time: string;
  location: string;
  icon: string;
  color: string;
}

interface ActivityPulse {
  id: string;
  x: number;
  y: number;
  active: boolean;
}

const iconMap: { [key: string]: LucideIcon } = {
  'shopping-bag': ShoppingBag,
  'zap': Zap,
  'truck': Truck,
};

const hiveActivities: HiveActivity[] = [
  {
    id: '1',
    type: 'group_buy',
    title: 'Costco Run',
    description: 'Join the monthly Costco bulk run',
    participants: 8,
    maxParticipants: 12,
    savings: '$45',
    organizerName: 'Sarah J.',
    time: 'Tomorrow, 10AM',
    location: 'Costco - Downtown',
    icon: 'shopping-bag',
    color: '#FF2D55',
  },
  {
    id: '2',
    type: 'split',
    title: 'Detergent Bulk Split',
    description: 'Split 24kg of eco-friendly detergent',
    participants: 4,
    maxParticipants: 6,
    savings: '$32',
    organizerName: 'Mike R.',
    time: 'This weekend',
    location: 'Central Park Meetup',
    icon: 'zap',
    color: '#34C759',
  },
  {
    id: '3',
    type: 'delivery',
    title: 'Shared Delivery',
    description: 'Pool IKEA delivery with neighbors',
    participants: 5,
    maxParticipants: 8,
    savings: '$28',
    organizerName: 'Emma L.',
    time: 'Next Tuesday',
    location: 'Your building lobby',
    icon: 'truck',
    color: '#FF9500',
  },
];

const activityPulses: ActivityPulse[] = [
  { id: '1', x: 0.2, y: 0.3, active: true },
  { id: '2', x: 0.5, y: 0.5, active: true },
  { id: '3', x: 0.8, y: 0.2, active: false },
  { id: '4', x: 0.3, y: 0.7, active: true },
  { id: '5', x: 0.7, y: 0.6, active: false },
];

const HiveScreen: React.FC = () => {
  const [activities, setActivities] = useState<HiveActivity[]>(hiveActivities);
  const [stats, setStats] = useState({ neighborCount: 247 });

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await apiService.getActivities();
      setActivities(data.map((activity: any) => ({
        id: activity.id.toString(),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        participants: activity.participants,
        maxParticipants: activity.maxParticipants,
        savings: activity.savings,
        organizerName: activity.organizerName,
        time: activity.time,
        location: activity.location,
        icon: activity.icon,
        color: activity.color,
      })));
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getHiveStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch hive stats:', error);
    }
  };

  const getIconComponent = (iconName: string): LucideIcon => {
    return iconMap[iconName] || ShoppingBag;
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Hive</Text>
        <View style={styles.memberCount}>
          <Users size={16} color={Colors.deepPink} />
          <Text style={styles.memberText}>{stats.neighborCount} neighbors</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Your Neighborhood</Text>
            <View style={styles.mapOverlay}>
              {activityPulses.map((pulse) => (
                <View
                  key={pulse.id}
                  style={[
                    styles.pulse,
                    {
                      left: `${pulse.x * 100}%`,
                      top: `${pulse.y * 100}%`,
                      backgroundColor: pulse.active ? Colors.deepPink : Colors.lightGray,
                    },
                  ]}
                >
                  {pulse.active && <View style={styles.pulseRing} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Activities</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {activities.map((activity) => {
          const IconComponent = getIconComponent(activity.icon);
          return (
          <TouchableOpacity key={activity.id} style={styles.activityCard} activeOpacity={0.9}>
            <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
              <IconComponent size={24} color={activity.color} />
            </View>
            
            <View style={styles.activityContent}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save {activity.savings}</Text>
                </View>
              </View>
              
              <Text style={styles.activityDescription}>{activity.description}</Text>
              
              <View style={styles.activityMeta}>
                <View style={styles.metaItem}>
                  <Users size={14} color={Colors.lightGray} />
                  <Text style={styles.metaText}>
                    {activity.participants}/{activity.maxParticipants} joined
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MapPin size={14} color={Colors.lightGray} />
                  <Text style={styles.metaText}>{activity.location}</Text>
                </View>
              </View>
              
              <View style={styles.activityFooter}>
                <Text style={styles.organizer}>by {activity.organizerName}</Text>
                <Text style={styles.time}>{activity.time}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.joinButton}>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ Create Activity</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberText: {
    color: Colors.charcoal,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  mapContainer: {
    marginBottom: Spacing.lg,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapText: {
    color: Colors.softDark,
    fontSize: 16,
    fontWeight: '500',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.deepPink,
    opacity: 0.3,
    transform: [{ scale: 1.5 }],
    left: -6,
    top: -6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  seeAll: {
    color: Colors.deepPink,
    fontSize: 14,
    fontWeight: '500',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  savingsBadge: {
    backgroundColor: `${Colors.sageGreen}20`,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  savingsText: {
    color: Colors.sageGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.softDark,
    marginBottom: Spacing.sm,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.softDark,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    fontSize: 12,
    color: Colors.softDark,
  },
  time: {
    fontSize: 12,
    color: Colors.deepPink,
    fontWeight: '500',
  },
  joinButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
    alignSelf: 'center',
  },
  createButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.deepPink,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  createButtonText: {
    color: Colors.deepPink,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HiveScreen;
